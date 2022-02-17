# tutorial-pact-js

[![build workflow](https://github.com/Xray-App/tutorial-pact-js/actions/workflows/build.yml/badge.svg)](https://github.com/Xray-App/tutorial-pact-js/actions/workflows/build.yml)
[![license](https://img.shields.io/badge/License-BSD%203--Clause-green.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/Xray-App/community)

## Overview

Code that supports the tutorial [Testing APIs using Pact-js](https://docs.getxray.app/display/XRAYCLOUD/Testing+APIs+using+Pact-js) showcasing the integration between [Xray Test Management](https://www.getxray.app/) on Jira and Pact-js.

## Prerequisites

In order to run this tutorial, you need to have NodeJS with the Maven plugin installed.
If you want to use the broker to upload your pacts you should have docker and docker-compose installed as well.

## Running

Tests can be run using `npm`.

### Consumer tests
```bash
npm run test:consumer
```

### Provider tests
```bash
npm run test:provider
```

### Run broker
```bash
docker-compose up
```

### Publish consumer results to broker
```bash
npm run pact:publish
```


## Submitting results to Jira

Results can be submitted to Jira so that they can be shared with the team and their impacts be easily analysed.
This can be achieved using [Xray Test Management](https://www.getxray.app/) as shown in further detail in this [tutorial](https://docs.getxray.app/display/XRAYCLOUD/Testing+APIs+using+Pact-js).

## Contact

Any questions related with this code, please raise issues in this GitHub project. Feel free to contribute and submit PR's.
For Xray specific questions, please contact [Xray's support team](https://jira.getxray.app/servicedesk/customer/portal/2).


## LICENSE

[BSD 3-Clause](LICENSE)
