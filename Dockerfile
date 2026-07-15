FROM nginx:alpine
# Copy all static website assets into the default Nginx html serving directory
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
