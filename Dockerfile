FROM nginx:alpine
# Set Nginx to listen on port 8080 (Cloud Run's default port)
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
