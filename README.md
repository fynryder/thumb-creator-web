# Thumbnail Creator

This project is web interface for thumb creator where user can register, login, and resize their images. It uses aws s3 as its cloud storage.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You will need followings to run the project

```
1. Node (node >= 8)
2. kafka (kafka >=2.1.0)
3. mysql (mysql ~ 8)
```

### Installing

A step by step series of examples that tell you how to get a development env running

These are the following steps to install the project.

```
1. npm install
2. node index.js
```

This is will start node on port 3000, which can be modified from config.js
Once done navigate to browser and hit ```http://127.0.0.1:3000```

## Overview
![alt text](https://github.com/fynryder/thumb-creator/blob/master/controlflow.jpg)

## Built With

* [AngularJs](https://angularjs.org/) - Javascript Framework
* [NodeJS](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
* [Material Design](https://materializecss.com/) - Material Design CSS Framework
* [Kafka](http://kafka.apache.org) - Messaging Queue

## Authors

* **Mukesh Verma** - *Initial work* - [thumb-creator](https://github.com/fynryder/thumb-creator-web)

See also the list of [contributors](https://github.com/fynryder/thumb-creator-web/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Stackoverflow
* Google
