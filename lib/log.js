const chalk = require("chalk");

const error = str => console.error(chalk.red(str));
const info = str => console.log(str);
const warn = str => console.log(chalk.keyword("orange")(str));
const success = str => console.log(chalk.green(str));
const debug = str => console.log(chalk.gray(str));

module.exports = {
    error,
    info,
    warn,
    success,
    debug
};