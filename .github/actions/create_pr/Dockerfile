FROM node:13.3.0-alpine

RUN npm install @actions/core
RUN npm install @actions/github

COPY index.js /index.js
COPY entrypoint.sh /entrypoint.sh

RUN chmod 777 index.js
RUN chmod 777 entrypoint.sh 

ENTRYPOINT ["node", "index.js"]
#ENTRYPOINT ["/entrypoint.sh"]

