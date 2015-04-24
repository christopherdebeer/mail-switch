FROM dockerfile/nodejs

RUN sudo apt-get -y update
RUN sudo apt-get -y install redis-tools

RUN mkdir -p /var/app
WORKDIR /var/app

COPY ./package.json /var/app/

ENV VIRTUAL_HOST mail-switch.0circle.co.uk
ENV MANDRILL_API_KEY $(MANDRILL_API_KEY)
EXPOSE 5000

RUN npm install
RUN npm install -g coffee-script

COPY ./ /var/app/

CMD npm start
