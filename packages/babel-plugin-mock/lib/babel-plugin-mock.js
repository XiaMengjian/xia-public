const { declare } = require('@babel/helper-plugin-utils')
const t = require('@babel/types')

const MODE_REPLACE = 'replace'

const babelMockPlugin = declare((api, options, dirname) => {
    api.assertVersion(7)

    return {
        pre(file) { },
        visitor: {
            Program: {
                enter(path, state) {
                    let importedName = []
                    path.traverse({
                        ImportDeclaration(curPath) {
                            const comments = curPath.node.leadingComments
                            if (!Array.isArray(comments) || comments.length === 0) {
                                curPath.skip()
                            } else {
                                const commentList = comments
                                    .filter((item) => item.type === 'CommentLine')
                                    .reduce((p, item) => {
                                        const group = item.value.trim().split(',')
                                        const list = group.map((innerItem) => {
                                            const { 0: original, 1: replace = original } = innerItem.split(':')
                                            return { original, replace }
                                        })
                                        return p.concat(list)
                                    }, [])

                                t.removeComments(curPath.node)

                                curPath.traverse({
                                    ImportSpecifier(importPath, state) {
                                        const { imported, local } = importPath.node
                                        const replaceNameIndex = commentList.findIndex((item) => item.original === imported.name)
                                        if (replaceNameIndex > -1) {
                                            const replaceName = commentList[replaceNameIndex].replace

                                            const name = path.scope.generateUid(
                                                options.mode === MODE_REPLACE ? `${replaceName}` : `assign-${replaceName}`,
                                            )

                                            if (options.mode === MODE_REPLACE) {
                                                path.scope.rename(local.name, name)
                                                importPath.remove()
                                            } else {
                                                const bindingScopePath = importPath.scope.getBinding(local.name)
                                                bindingScopePath &&
                                                    bindingScopePath.referencePaths.forEach((i) => {
                                                        i.parentPath.replaceWith(t.callExpression(t.identifier(name), [i.parentPath.node]))
                                                    })
                                            }

                                            importedName.push({ importedName: name, localName: replaceName })
                                        }
                                    },
                                })
                                const specifiers = curPath.get('specifiers')
                                if (specifiers.length === 0) {
                                    curPath.remove()
                                }
                            }
                        },
                    })
                    if (importedName.length > 0) {
                        const specifier = importedName.map((item) => {
                            return t.importSpecifier(t.identifier(item.importedName), t.identifier(item.localName))
                        })

                        path.node.body.unshift(t.importDeclaration(specifier, t.stringLiteral(options.mockPath)))
                    }
                },
            },
        },
        post() { },
    }
})
module.exports = babelMockPlugin
