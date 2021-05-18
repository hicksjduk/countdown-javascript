const winston = require("winston")
winston.add(new winston.transports.Console())
const log = message => winston.log('info', message)

const Priority = "LOW HIGH ATOMIC".split(" ").reduce(
    (obj, key, priority) => {
        obj[key] = priority
        return obj
    }, {})

function number(num) {
    return {
        value: num,
        count: 1,
        string: `${num}`,
        priority: Priority.ATOMIC
    }
}

function operator(symbol, evaluator, priority, commutative) {
    return {symbol, evaluator, priority, commutative}
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
        count: leftOperand.count + rightOperand.count,
        string: toString(leftOperand, operator, rightOperand),
        priority: operator.priority
    }
}

function toString(leftOperand, operator, rightOperand) {
    const leftInParens = leftOperand.priority < operator.priority
    const rightInParens = rightOperand.priority < operator.priority ||
        (rightOperand.priority == operator.priority && !operator.commutative)
    return [
        leftInParens ? `(${leftOperand.string})` : `${leftOperand.string}`,
        operator.symbol,
        rightInParens ? `(${rightOperand.string})` : `${rightOperand.string}`
    ].join(" ")
}

const combiners = [
    (a, b) => expression(a, Operator.ADD, b),
    (a, b) => {
        if (a.value <= b.value || a.value == b.value * 2)
            return null
        return expression(a, Operator.SUBTRACT, b)
    },
    (a, b) => {
        if (a.value == 1 || b.value == 1)
            return null
        return expression(a, Operator.MULTIPLY, b)
    },
    (a, b) => {
        if (b.value == 1 || (a.value % b.value) || a.value == b.value ** 2)
            return null
        return expression(a, Operator.DIVIDE, b)
    }
]

function* permute(arr) {
    if (arr.length == 1)
        yield arr
    else if (arr.length) {
        const used = usedChecker(e => e.value)
        for (let i = 0; i < arr.length; i++) {
            const value = arr[i]
            if (!used(value)) {
                yield [value]
                const others = arr.slice(0, i).concat(arr.slice(i + 1))
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
        const used = usedChecker(e => e.value)
        for (let i = 1; i < permutation.length; i++)
            for (const left of expressions(permutation.slice(0, i)))
                for (const right of expressions(permutation.slice(i)))
                    for (const comb of combiners) {
                        const expr = comb(left, right)
                        if (expr && !used(expr))
                            yield expr
                    }
    }
}

function solve(target, ...numbers) {
    log('------------------------------')
    log(`Target: ${target}, numbers: ${numbers.join(", ")}`)
    const nums = numbers.map(n => number(n))
    const better = betterChecker(target)
    let answer = null
    for (const permutation of permute(nums))
        for (const expr of expressions(permutation)) {
            const best = better(answer, expr)
            if (best !== answer) {
                log(`${best.string} = ${best.value}`)
                answer = best
            }
        }
    if (!answer)
        log("No solution found")
    log('------------------------------')
    return answer
}

function betterChecker(target) {
    return (a, b) => {
        const [diffA, diffB] = [a, b].map(x => x ? Math.abs(target - x.value) : 1000)
        if (Math.min(diffA, diffB) > 10)
            return null
        if (diffA != diffB)
            return diffA < diffB ? a : b
        return a.count <= b.count ? a : b
    }
}

module.exports = {solve}