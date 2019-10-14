import argparse
import copy
import json
import logging
import re
import time
from functools import reduce

import boto3
import requests
from mcrcon import MCRcon


logging.basicConfig(
    format='%(asctime)s [BlockParty] %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')

EC2 = None


def main():
    config = load_configuration()
    EC2 = boto3.client('ec2', region_name=config['region_name'])
    ec2_instances = EC2.describe_instances()

    instance = None

    for reservation in ec2_instances['Reservations']:
        for reservation_instance in reservation['Instances']:
            if reservation_instance['InstanceId'] == config['instance_id']:
                instance = reservation_instance
                break

    if instance is None:
        raise(Exception(
            'Instance [{}] not found in running ec2 instances'.format(config['instance_id'])))

    if config['debug']:
        while(True):
            refresh_config(config)
            update_player_numbers(config)
            check_shutoff(config)
            time.sleep(config['player_check_interval'])
    else:
        update_player_numbers(config)
        check_shutoff(config)

    return


def load_configuration():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        '-c', '--config', type=argparse.FileType('r'), required=True)
    parser.add_argument(
        '-d', '--debug', required=False, action='store_true')
    parser.add_argument(
        '-s', '--store', required=False)

    args = parser.parse_args()

    config = json.loads(args.config.read())
    config['config_file'] = args.config.name
    args.config.close()

    config['debug'] = args.debug

    try:
        store = None
        with open(config['server_store'], 'r') as server_store:
            store = json.loads(server_store.read())
            if config['debug']:
                print("========== Loaded store ===========")
                pprint(store)
                print()

        for key in store.keys():
            store[key] = []

        with open(config['server_store'], 'w+') as server_store:
            server_store.write(json.dumps(store, indent=2))

    except Exception as e:
        print(str(e))
        with open(config['server_store'], 'w+') as server_store:
            server_store.write(json.dumps({}, indent=2))

    r = requests.get(
        'http://169.254.169.254/latest/dynamic/instance-identity/document')
    response_json = r.json()

    config['region_name'] = response_json.get('region')
    config['instance_id'] = response_json.get('instanceId')

    if config['debug']:
        print("========== Loaded config ==========")
        pprint(config)
        print()

    return config


def refresh_config(config):
    before_config = copy.deepcopy(config)
    with open(config['config_file']) as config_file:
        refreshed_config = json.loads(config_file.read())
        for key in refreshed_config.keys():
            config[key] = refreshed_config[key]
    if before_config != config and config['debug']:
        print("======== Refreshed config =========")
        pprint(config)
        print()


def update_player_numbers(config):
    new_statuses = {}

    for server in config['servers'].keys():

        host = config['servers'][server]['host']
        port = config['servers'][server]['port']
        password = config['servers'][server]['password']
        players_online = 0

        try:
            mcr = MCRcon(host=host, password=password, port=port)
            mcr.connect()

            players_online = mcr.command('list')
            players_online = re.sub(r'(§[0-9]|§[a-z])', '', players_online)
            players_online = int(re.search(r'\d+|$', players_online).group())

            mcr.disconnect()
        except Exception as e:
            logging.warning(
                f'{host}:{port} could not be reached.\n{str(e)}')

        new_statuses[server] = players_online

    server_store = open(config['server_store'], 'r')
    cached_statuses = json.loads(server_store.read())
    server_store.close()

    if config['debug']:
        print("========= Loaded statuses =========")
        pprint(cached_statuses)
        print()

    for server in set(new_statuses.keys()).union(cached_statuses.keys()):
        if server in new_statuses and server in cached_statuses:
            cached_statuses[server].append(new_statuses[server])
            cached_statuses[server] = cached_statuses[server][-3:]

        elif server in new_statuses and server not in cached_statuses:
            logging.info(
                f'Found server {server} from config, adding to cached statuses list')
            cached_statuses[server] = [new_statuses[server]]

        elif server not in new_statuses and server in cached_statuses:
            if len(cached_statuses[server]) == 3 and sum(cached_statuses[server]) == 0:
                logging.warning(
                    f'Dropping check for server {server} due to inactivity'
                )
                del cached_statuses[server]
            else:
                cached_statuses[server].append(0)
                cached_statuses[server] = cached_statuses[server][-3:]

        else:
            raise(Exception("Something's fucky"))

    server_store = open(config['server_store'], 'w')
    server_store.write(json.dumps(cached_statuses, indent=2))
    server_store.close()

    if config['debug']:
        print("======== Updated statuses =========")
        pprint(cached_statuses)
        print()


def check_shutoff(config):
    sum_players = 0

    server_store = open(config['server_store'], 'r')
    cached_statuses = json.loads(server_store.read())
    server_store.close()

    for server in cached_statuses.keys():
        if len(cached_statuses[server]) < 3:
            sum_players += 1  # keep alive for logging in
        sum_players += sum(cached_statuses[server])

    if config['debug']:
        print("========== Check shutoff ==========")
        pprint({"total_historical_num_players": sum_players})
        print()

    if sum_players == 0:
        if config['debug']:
            print("========= Saving servers ==========")
        for server in cached_statuses.keys():
            try:
                host = config['servers'][server]['host']
                port = config['servers'][server]['port']
                password = config['servers'][server]['password']

                mcr = MCRcon(host=host, password=password, port=port)
                mcr.connect()

                resp = mcr.command('save-all')

                if config['debug']:
                    print(f'save-all response for {server}: {resp}')
                logging.info(f'save-all response for {server}: {resp}')

                mcr.disconnect()
            except Exception as e:
                logging.warning(
                    f'An error occured for server {server}\n{str(e)}')

        if config['debug']:
            print()
            print("===== Shutting down instance ======")

        resp = EC2.stop_instances(InstanceIds=[config['instance_id']])

        if config['debug']:
            pprint(resp)
            print()

        logging.info(f'Shutting down instance.\n{resp}')


def pprint(obj):
    print(json.dumps(obj, indent=2))


if __name__ == '__main__':
    main()
