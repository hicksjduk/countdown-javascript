const {When, Then, defineParameterType} = require("@cucumber/cucumber")
const solve = require("../../solver.js")
const assert = require("assert")

defineParameterType({name: "ints", regexp: /\d+(?:\s*,\s*\d+)*/, 
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

function validateSolution(result, expectedValue, expectedCount, expectedNumbers) {
    assert.strictEqual(result.value, expectedValue)
    assert.strictEqual(result.numbers.length, expectedCount)
    assert(!result.numbers.find(n => {
        const pos = expectedNumbers.indexOf(n)
        if (pos == -1)
            return true
        expectedNumbers.splice(pos, 1)
        return false
    }))
}