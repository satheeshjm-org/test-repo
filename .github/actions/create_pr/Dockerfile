FROM node:13.3.0-alpine

RUN npm install @actions/core
RUN echo "a"
RUN npm install @actions/github

COPY source/app.js /app.js

ENTRYPOINT ["node", "app.js"]
