# Sourceful Backend Test

## Author: Icheka Ozuru ([https://github.com/Icheka/sourceful-backend-test](https://github.com/Icheka/sourceful-backend-test))

## Implementation:

- Backend: TypeScript, Node.js (Express.js)
- Frontend: TypeScript, React.js

# The Problem

Create an API endpoint that accepts a cart of fruits and returns the bill, with tax and discounts applied.

# The Solution

A simple endpoint is exposed at `POST /checkout`. The endpoint accepts a JSON payload containing a `cart` field that points to an Array of individual products identified by their names. `POST /checkout` processes the bill for the uploaded cart and returns a JSON-formatted response.

The actual processing is handled by `processProductsBill()`, a function contained in the `Products` model file (`/api/src/models/product.ts`). `processProductsBill()` accepts a list of products as its only argument. It proceeds to calculate the bill for the cart of products in two steps, each one processing a specific class of discount.

## How Discounts are Modeled

The author identified two classes of discounts that needed to be processed:

1. Single-item discounts: discounts where a single product is involved. For example: 10% off Pineapple.
2. Multi-item discounts: discounts that involve a pre-condition to be met by certain products before a discount may be offered for another product. For example: Buy 2 Apples and get 50% off 1 Strawberry.

## Business Logic and the Use of a Rule Engine

It has been the author's experience that truly scalable applications need to recognise business logic and application logic as distinct, independent components. Where application logic (such as endpoint routes or internal architecture) is often intransient, business logic (such as the percentages of discounts to offer, or what season of the year to offer certain discounts) is often changeable and fluid. A shop might wish to offer a certain discount only on bank holidays, for example.

In order to leave room for changing the specifics of the discounts at a later date, as well as to enhance readability, maintainability and testability of the logic around discounts, the author opted to use a "rule engine". [See here for more information about rule engines and how they are helpful for solving problems like this](http://www.jbug.jp/trans/jboss-rules3.0.2/ja/html/ch01s02.html).

Discounst are represented by rules in the `/api/src/rules-engine/discounts.ts` file. There are two engines, each representing one of the two classes of discounts the author identified (see "How Discounts are Modeled" above).

## Processing Discount Rules in Two Stages

Since there are two kinds of discounts, the author opted to process each separately (but not independently, as you will find in `/api/src/models/product.ts`). Multi-item discounts are processed first in order to avoid processing tax/discounts more than once for any product. After each stage is completed, the just-processed product is removed from the cart to eliminate the risk of accidentally processing a product more than once.

## Refactoring and Extensibility

The author recognises that, although well thought-out, the present state of the codebase is (essentially) little better than a brute-force solution to the problem. The author has identified a number of ways the codebase could benefit from refactoring, but like with all software, these improvements can be implemented gradually.

## Tests

There are extensive unit tests written for the utility functions in `/api`. These tests can be run with the `npm run test` command. There are 6 test suites with a total of 14 individual tests and these tests all pass. Test coverage is very close to 100%.

- Statements: 92.18%
- Branches: 73.71%
- Functions: 88.88%
- Lines: 94.52%

You can view this Istanbul coverage report by:

1. Running `npm run test`
2. Starting a server in the root directory (or in the `/api` directory)
3. Navigating to `your-server:your-port/api/coverage/lcov-report` (`your-server:your-port/coverage/lcov-report` if you start your server within `/api`)

## Client

A simple client (written in React.js/TypeScript) is included under `/client`. There are no unit tests (although they would be trivial to implement using React Testing Library) because there are so few components (only 3) and there isn't a lot of logic in the implementation.

## Containerisation and Deployment

Both `/client` and `/api` contain a `Dockerfile` file that provides configuration for building a Docker image for the each service. `docker-compose` is used to orchestrate these two containers from a `docker-compose.yaml` file in `/devtools`. A `Makefile` is included with commands for starting the services.

To start the services:

1. Ensure Docker is installed ([see here for instructions for installing Docker on your computer/server](https://docs.docker.com/desktop/install))
2. Run `docker --version` to ensure Docker is configured properly. If an error is outputed, you might need to uninstall/unlink and re-install Docker
3. Ensure `Make` is installed. If it isn't, a quick Google search will present you with directions for installing and configuring `Make`
4. In the root directory of the mono-repo, run `make start`

If all goes well, you should see logs in your terminal that alert you to `api` and `client` running in the background. You'll also see logs from the `api` container.

Visit `localhost:3000` in a browser to view/test the React client.
Alternatively, you can make requests directly to the API at `localhost:4000/checkout`.

Using cURL (ensure cURL is installed first):

Run:

```bash
curl -X POST http://localhost:4000/checkout -H "Content-Type: application/json" -d '{"cart": ["Apple", "Apple", "Pineapple", "Strawberry"]}'
```

The response should look like (after pretty-printing):

```bash
{
    "discounts": [
        "50% off Strawberry: -$9.995",
        "10% off Pineapple: -$2.499"
    ],
    "taxes": 9.3744,
    "subTotal": 66.96,
    "total": 63.84039999999999
}
```
