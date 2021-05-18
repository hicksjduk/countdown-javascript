const solve = require("./solver")

try {
    const args = validate(process.argv.slice(2).map(v => v * 1))
    if (args.length == 7) {
        solve(...args)
    } else {
        solve(...selectRandomNumbers(args[0]))
    }
} catch (e) {
    console.log(e.message)
    process.exit(1)
}

function validate(args) {
    if (args.findIndex(n => isNaN(n)) != -1)
        throw new Error("All arguments must be numbers")
    if (args.length != 1 && args.length != 7)
        throw new Error("Must specify either one number (the number of large numbers to select) " +
                        "or seven numbers, of which the first is the target")
    if (args.length == 1) {
        if (args[0] < 0 || args[0] > 4)
            throw new Error("Number of large numbers must be in the range 0 to 4 inclusive")
    } else {
        const [target, ...numbers] = args
        if (target < 100 || target > 999)
            throw new Error("Target number must be in the range 100 to 999 inclusive")
        const occurrences = {}
        numbers.forEach(n => {
            if (n < 1 || n > 100 || (n > 10 && n % 25))
                throw new Error("Source numbers must be in the range 1 to 10, or 25, 50, 75 or 100")
            const occ = (occurrences[n] ?? 0) + 1
            if (n <= 10 && occ > 2)
                throw new Error("Small source numbers (<=10) cannot appear more than twice")
            if (n > 10 && occ > 1)
                throw new Error("Large source numbers (>10) cannot appear more than once")
            occurrences[n] = occ
        })
    }
    return args
}

function selectRandomNumbers(largeCount) {
    const target = randomInt(100, 1000)
    const large = [25, 50, 75, 100]
    const small = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10]
    const numbers = []
    while (largeCount--)
        numbers.push(...large.splice(randomInt(0, large.length), 1))
    while (numbers.length < 6)
        numbers.push(...small.splice(randomInt(0, small.length), 1))
    return [target, ...numbers]
}

function randomInt(minInclusive, maxExclusive) {
    return Math.floor(Math.random() * (maxExclusive - minInclusive)) + minInclusive
}