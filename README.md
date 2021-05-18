# countdown-javascript

A Javascript solver for the numbers game as played on 
[the TV show "Countdown"](https://www.channel4.com/programmes/countdown).

In each game, six source numbers are chosen at random, a three-digit target number is generated,
and the objective is to make an arithmetic expression which uses some or all of the
source numbers, together with the four basic arithmetic operations, to make a total that
is as close as possible to the target number. A solution scores 10 points if it hits the
target number exactly; 7 if it differs from the target number by between 1 and 5 inclusive;
5 if it differs from the target number by between 6 and 10 inclusive; and nothing if it
differs by more than 10.

This solver finds the best possible solution that differs from the target number by 10 or less.
One solution is regarded as being better than another if it differs from the target number by a 
smaller amount, or if it differs by the same amount but uses fewer source numbers. If there is 
no solution that differs by 10 or less, no solution is returned.

## Testing

The tests in this repository use BDD (behaviour-driven development) tests, specified in feature
files written in [the Gherkin language](https://cucumber.io/docs/gherkin/reference/), and using 
[the Javascript implementation of Cucumber](https://github.com/cucumber/cucumber-js) to run them.

The following steps are required in order to enable the automatic discovery and running of
tests with Cucumber in a NodeJS project:
* Install Cucumber: `npm install -D @cucumber/cucumber`.
* In `package.json`, set the test script to be `cucumber-js`.
* In the root directory of the project, create a subdirectory called `features` which contains:
   * One or more feature files.
   * A `steps` subdirectory which contains one or more Javascript files. Each file contains
    'glue code' that specifies the implementation of steps in the feature files.

Once this is done, the tests can be discovered and run using the command `npm test`.

### Step implementation notes

The step implementations assert whether expectations are met using 
[the `assert` package](https://www.npmjs.com/package/assert), which is installed using the command
`npm install -D assert`.

Sharing of data between steps is done using a "world" object that is injected into each glue code
function using the keyword `this`. However, this only works if the glue code function is defined using
the `function` keyword, not as an arrow function.