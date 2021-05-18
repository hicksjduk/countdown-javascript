# countdown-javascript

A Javascript solver for the numbers game as played on 
[the TV show "Countdown"](https://www.channel4.com/programmes/countdown).

In each game, six source numbers are chosen at random (they may include up to two instances
of each number between 1 and 10 inclusive, and up to one instance each of 25, 50, 75 and 100);
a three-digit target number is generated;
and the objective is to make an arithmetic expression which uses some or all of the
source numbers, together with the four basic arithmetic operations, to make a total that
is as close as possible to the target number. 

A solution scores 10 points if it hits the
target number exactly; 7 if it differs from the target number by between 1 and 5 inclusive;
5 if it differs from the target number by between 6 and 10 inclusive; and nothing if it
differs by more than 10. However, if the two players come up with solutions that
differ from the target number by different amounts, only the one with the closer solution
scores points.

This solver finds the best possible solution that differs from the target number by 10 or less.
One solution is regarded as being better than another if it differs from the target number by a 
smaller amount, or if it differs by the same amount but uses fewer source numbers. If there is 
no solution that differs by 10 or less, no solution is returned.

## Running

To run the solver from the command line, make the root directory of the repository the
current directory, then execute either of the following commands, followed
by a list of arguments, separated by spaces:
* `node index.js`
* `npm run solve`

For example: `npm run solve 502 3 2 50 2 1 4` or `node index.js 3`

The argument list must conform to the following rules, otherwise an error message is issued
and the solver is not run:
* The number of arguments must be either 1 or 7.
* All arguments must be numbers.
* If the number of arguments is 1, this denotes that the source numbers and target should be chosen
randomly. The argument specified must be in the range 0 to 4 inclusive, and specifies the number of 
large source numbers (greater than 10) to be chosen; the remainder are chosen from among the small
numbers.
* If the number of arguments is 7, this denotes that the first argument is the target number, and the
other arguments the source numbers, to be used. Each number must be in the valid range for that type
of number, and the number of occurrences of each source number must also be valid.

If the argument list is valid, the solver is run with the specified numbers (if there are 7 arguments)
or randomly-generated numbers (if there is 1).

## Testing

The tests in this repository use BDD (behaviour-driven development) tests, specified in feature
files written in [the Gherkin language](https://cucumber.io/docs/gherkin/reference/), and using 
[the Javascript implementation of Cucumber](https://github.com/cucumber/cucumber-js) to run them.

The following steps are required in order to enable the automatic discovery and running of
tests with Cucumber in a Node.js project:
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