const {When, Then, defineParameterType} = require("@cucumber/cucumber")
const solve = require("../../solver.js")
const assert = require("assert")

defineParameterType({
    name: "ints", 
    regexp: /\d+(?:\s*,\s*\d+)*/, 
    transformer: str => str.split(/\D+/).map(i => i * 1)
})

When("I call the solver with target number {int} and numbers {ints}", 
    function(target, numbers) {
        this.target = target
        this.numbers = numbers
        this.result = solve(target, ...numbers)
    })

Then("a solution is found whose value equals the target number and which uses {int} numbers", 
    function(expectedCount) {
        validateSolution(this.result, this.target, expectedCount, this.numbers)
    })

Then("a solution is found whose value equals {int} and which uses {int} numbers", 
    function(expectedValue, expectedCount) {
        validateSolution(this.result, expectedValue, expectedCount, this.numbers)
    })

Then("no solution is found", 
    function() {
        assert(!this.result)
    })

function validateSolution(result, expectedValue, expectedCount, sourceNumbers) {
    assert.strictEqual(result.value, expectedValue)
    assert.strictEqual(result.numbers.length, expectedCount)
    const [maxCounts, actualCounts] = 
        [counts(sourceNumbers), counts(result.numbers)]
    Object.entries(actualCounts).forEach(
        ([num, count]) => assert((maxCounts[num] ?? 0) >= count))
}

function counts(numbers) {
    const answer = {}
    numbers.forEach(n => answer[n] = (answer[n] ?? 0) + 1)
    return answer
}