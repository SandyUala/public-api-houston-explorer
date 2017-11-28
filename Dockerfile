FROM nginx
COPY build /usr/share/nginx/html/
RUN rm /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/default.tpl
CMD ["/bin/bash", "-c", "envsubst '$APIs' < /etc/nginx/conf.d/default.tpl > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
