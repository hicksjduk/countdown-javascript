const {When, Then, defineParameterType} = require("@cucumber/cucumber")
const {solve} = require("../../index.js")
const assert = require("assert")

defineParameterType({name: "ints", regexp: /\d+(?:\s*,\s*\d+)*/, 
    transformer: str => str.split(/\D+/).map(i => i * 1)
})

When("I call the solver with target number {int} and numbers {ints}", 
    function(target, numbers) {
        this.target = target
        this.result = solve(target, ...numbers)
    })

Then("a solution is found whose value equals the target number and which uses {int} numbers", 
    function(count) {
        validateSolution(this.result, this.target, count)
    })

Then("a solution is found whose value equals {int} and which uses {int} numbers", 
    function(value, count) {
        validateSolution(this.result, value, count)
    })

Then("no solution is found", 
    function() {
        assert(!this.result)
    })

function validateSolution(result, expectedValue, expectedCount) {
    assert.strictEqual(result.value, expectedValue)
    assert.strictEqual(result.count, expectedCount)
}