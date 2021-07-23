const acorn = require('acorn')
const chalk = require('chalk')
const { SourceMapConsumer } = require('source-map')
const { readFileSync } = require('fs')

const PLUGIN_NAME = 'CheckESSyntaxPlugin'

const T_1 = (file) => {
  process.stdout.write(chalk.green(`\n*** 文件: ${file} ***\n`))
}

const T_2 = (file) => {
  process.stdout.write(chalk.red(`● 错误信息\n`))
}

const T_3 = (key, value) => {
  process.stdout.write(chalk.yellow(`    • ${key}: ${value}\n`))
}

const T_4 = () => {
  process.stdout.write(chalk.blue(` ● sourceMap\n`))
}

const sourceMapFinder = (rawSourceMap, errLine, errColumn) => {
  return SourceMapConsumer.with(rawSourceMap, null, (consumer) => {
    const pos = consumer.originalPositionFor({
      line: errLine,
      column: errColumn,
    })

    T_4()
    Object.keys(pos).forEach((item) => {
      T_3(item, pos[item])
    })

    const { source, line, column, name } = pos
    if (source) {
      const sourceFileContent = consumer.sourceContentFor(source) // 原始文件内容
    }
    consumer.destroy()
  })
}

class CheckESSyntaxPlugin {
  constructor(opt) {
    this.opt = opt || {}
  }

  apply(compiler) {
    process.stdout.write(chalk.blue.bgRedBright.bold(`\n---------- ${PLUGIN_NAME} ----------`))
    compiler.hooks.afterEmit.tapPromise(PLUGIN_NAME, async (compilation) => {
      const assets = compilation.assets
      // 取出js 文件
      const assetsFiles = Object.keys(assets).filter((fileName) => fileName.endsWith('.js'))
      for (const file of assetsFiles) {
        const source = assets[file]
        try {
          acorn.parse(source.source(), {
            ecmaVersion: this.opt.ecmaVersion || 5,
          })
        } catch (e) {
          const { line, column } = e.loc
          const { devtool, output } = compiler.options
          if (devtool) {
            const rawSourceMap = JSON.parse(readFileSync(`${output.path}/${file}.map`, 'utf8'))
            if (rawSourceMap) {
              T_1(file)
              T_2()
              T_3('message', e.toString())
              T_3('originLine', line)
              T_3('originColumn', column)
              await sourceMapFinder(rawSourceMap, line, column)
            }
          }
        }
      }
    })
  }
}
module.exports = CheckESSyntaxPlugin
