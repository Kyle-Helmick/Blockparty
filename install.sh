#! /bin/bash

pipenv install --deploy

#write out current crontab

crontab -l > mycron

#echo new cron into cron file

echo "*/5 * * * * cd $PWD && $(which pipenv) run python $PWD/main.py --config config.json" >> mycron

#install new cron file

crontab mycron

rm mycron
