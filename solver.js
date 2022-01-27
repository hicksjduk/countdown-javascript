const winston = require("winston")
winston.add(new winston.transports.Console())
const log = message => winston.log('info', message)

function solve(target, ...numbers) {
    log('------------------------------')
    log(`Target: ${target}, numbers: ${numbers.join(", ")}`)
    const [answer, time] = doTimed(solver(target, numbers))
    log(`Finished in ${time}ms`)
    if (!answer)
        log("No solution found")
    log('------------------------------')
    return answer
}

function solver(target, numbers) {
    return () => {
        const nums = numbers.map(n => number(n))
        const better = betterChecker(target)
        let answer = null
        for (const permutation of permute(nums))
            for (const expr of expressions(permutation)) {
                if (better(answer, expr) === expr) {
                    log(`${expr.string()} = ${expr.value}`)
                    answer = expr
                }
            }
        return answer
    }
}

function doTimed(func) {
    const start = new Date().getTime()
    const result = func()
    const end = new Date().getTime()
    return [result, end - start]
}

function* permute(arr) {
    if (arr.length == 1)
        yield arr
    else if (arr.length) {
        const used = usedChecker(e => e.value)
        for (let i = 0; i < arr.length; i++) {
            const value = arr[i]
            if (!used(value)) {
                yield [value]
                const others = [...arr.slice(0, i), ...arr.slice(i + 1)]
                for (const perm of permute(others))
                    yield [value, ...perm]
            }
        }
    }
}

function usedChecker(idGenerator) {
    const usedIds = new Set()
    return value => {
        const id = idGenerator(value)
        if (usedIds.has(id))
            return true
        usedIds.add(id)
        return false
    }
}

function* expressions(permutation) {
    if (permutation.length == 1)
        yield permutation[0]
    else if (permutation.length) {
        for (let i = 1; i < permutation.length; i++)
            for (const leftOperand of expressions(permutation.slice(0, i))) {
                const combiners = combinersUsing(leftOperand)
                for (const rightOperand of expressions(permutation.slice(i)))
                    for (const combine of combiners) {
                        const expr = combine(rightOperand)
                        if (expr)
                            yield expr
                    }
            }
    }
}

function betterChecker(target) {
    return (a, b) => {
        const [diffA, diffB] = [a, b].map(x => x ? Math.abs(target - x.value) : 1000)
        if (Math.min(diffA, diffB) > 10)
            return null
        if (diffA != diffB)
            return diffA < diffB ? a : b
        const [numsA, numsB] = [a, b].map(x => x.numbers.length)
        if (numsA != numsB)
            return numsA < numsB ? a : b
        return a.parentheses <= b.parentheses ? a : b
    }
}

const Priority = "LOW HIGH ATOMIC".split(" ").reduce(
    (obj, key, priority) => {
        obj[key] = priority
        return obj
    }, {})

function number(num) {
    return {
        value: num,
        numbers: [num],
        parentheses: 0,
        string: () => `${num}`,
        priority: Priority.ATOMIC
    }
}

function operator(symbol, evaluator, priority, commutative) {
    return { symbol, evaluator, priority, commutative }
}

const Operator = {
    ADD: operator("+", (a, b) => a + b, Priority.LOW, true),
    SUBTRACT: operator("-", (a, b) => a - b, Priority.LOW, false),
    MULTIPLY: operator("*", (a, b) => a * b, Priority.HIGH, true),
    DIVIDE: operator("/", (a, b) => a / b, Priority.HIGH, false)
}

function expression(leftOperand, operator, rightOperand) {
    return {
        value: operator.evaluator(leftOperand.value, rightOperand.value),
        numbers: [...leftOperand.numbers, ...rightOperand.numbers],
        parentheses: [parenthesiseLeft(operator, leftOperand), 
                      parenthesiseRight(operator, rightOperand)].filter(v => v).length
                      + leftOperand.parentheses + rightOperand.parentheses,
        string: () => toString(leftOperand, operator, rightOperand),
        priority: operator.priority
    }
}

function toString(leftOperand, operator, rightOperand) {
    return [
        parenthesiseLeft(operator, leftOperand) ? `(${leftOperand.string()})` : `${leftOperand.string()}`,
        operator.symbol,
        parenthesiseRight(operator, rightOperand) ? `(${rightOperand.string()})` : `${rightOperand.string()}`
    ].join(" ")
}

function parenthesiseLeft(operator, leftOperand) {
    return leftOperand.priority < operator.priority
}

function parenthesiseRight(operator, rightOperand) {
    return rightOperand.priority < operator.priority ||
    (rightOperand.priority == operator.priority && !operator.commutative)
}

const combinerCreators = [
    a => b => expression(a, Operator.ADD, b),
    a => a.value < 3 ? null :
        b => a.value <= b.value || a.value == b.value * 2 ? null :
            expression(a, Operator.SUBTRACT, b),
    a => a.value == 1 ? null :
        b => b.value == 1 ? null :
            expression(a, Operator.MULTIPLY, b),
    a => a.value == 1 ? null :
        b => b.value == 1 || a.value % b.value || a.value == b.value ** 2 ? null :
            expression(a, Operator.DIVIDE, b)
]

function combinersUsing(expr) {
    return combinerCreators.map(cc => cc(expr)).filter(x => x)
}

module.exports = solve