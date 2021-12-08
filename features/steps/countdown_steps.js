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
    assertIsSubsetOf(sourceNumbers)(result.numbers)
}

function assertIsSubsetOf(superset) {
    const [expectedCounts, actualCounts] = [{}, {}]
    const incrementCount = (obj, key) => obj[key] = (obj.key ?? 0) + 1
    superset.forEach(v => incrementCount(expectedCounts, v))
    return subset => {
        subset.forEach(v => {
            const exp = expectedCounts[v];
            assert(exp, `Unexpected value ${v}`)
            const act = incrementCount(actualCounts, v)
            assert(act <= exp, 
                `Expected up to ${exp} occurrence(s) of ${v}, but found at least ${act}`)
        })
    }
}