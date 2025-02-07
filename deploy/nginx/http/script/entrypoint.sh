#!/bin/sh
echo "start nginx"

#set TZ
cp /usr/share/zoneinfo/${TZ} /etc/localtime && \
echo ${TZ} > /etc/timezone && \

mkdir -p /etc/nginx/conf.d

#collect services
SERVICES=$(find "/etc/nginx/" -type f -maxdepth 1 -name "service*.conf")

#copy /etc/nginx/service*.conf if any of service*.conf mounted
if [ ${#SERVICES} -ne 0 ]; then
    cp -fv /etc/nginx/service*.conf /etc/nginx/conf.d/
fi

nginx -g "daemon off;"
