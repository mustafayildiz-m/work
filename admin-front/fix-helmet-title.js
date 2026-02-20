module.exports = function (fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
    let modified = false;

    // 1. Find all JSXElements that are <title>
    root.find(j.JSXElement, { openingElement: { name: { name: 'title' } } })
        .forEach(path => {
            let hasFormattedMessage = false;

            // Extract all children to build a template literal or string concatenation
            const newChildren = [];
            path.node.children.forEach(child => {
                if (child.type === 'JSXElement' && child.openingElement.name.name === 'FormattedMessage') {
                    hasFormattedMessage = true;
                    // Extract id
                    const idAttr = child.openingElement.attributes.find(a => a.name.name === 'id');
                    if (idAttr) {
                        const idVal = idAttr.value.value;
                        // Create intl.formatMessage({ id: 'X' })
                        const callExp = j.callExpression(
                            j.memberExpression(j.identifier('intl'), j.identifier('formatMessage')),
                            [j.objectExpression([
                                j.property('init', j.identifier('id'), j.literal(idVal))
                            ])]
                        );
                        newChildren.push(j.jsxExpressionContainer(callExp));
                    }
                } else {
                    newChildren.push(child); // keep text or other expressions
                }
            });

            if (hasFormattedMessage) {
                modified = true;

                // If there are multiple children, we probably want to combine them into a single string expression
                // to pass to <title>{...}</title>, but React actually accepts multiple JSX expressions inside <title> 
                // as long as they evaluate to strings. E.g. <title>{intl...} {id} {intl...}</title> is valid.
                // Let's replace the children.
                path.node.children = newChildren;

                // Ensure we add import { useIntl } from 'react-intl';
                let useIntlImportExists = false;
                root.find(j.ImportDeclaration, { source: { value: 'react-intl' } }).forEach(imp => {
                    const specifierExists = imp.node.specifiers.find(s => s.imported && s.imported.name === 'useIntl');
                    if (!specifierExists) {
                        imp.node.specifiers.push(j.importSpecifier(j.identifier('useIntl')));
                    }
                    useIntlImportExists = true;
                });

                if (!useIntlImportExists) {
                    const importDecl = j.importDeclaration(
                        [j.importSpecifier(j.identifier('useIntl'))],
                        j.literal('react-intl')
                    );
                    root.get().node.program.body.unshift(importDecl);
                }

                // We also need to add `const intl = useIntl();` inside the parent component.
                // Let's find the nearest enclosing ArrowFunctionExpression or FunctionDeclaration.
                let componentNodePath = path;
                while (componentNodePath && componentNodePath.node.type !== 'ArrowFunctionExpression' && componentNodePath.node.type !== 'FunctionDeclaration' && componentNodePath.node.type !== 'FunctionExpression') {
                    componentNodePath = componentNodePath.parent;
                }

                if (componentNodePath && componentNodePath.node.body && componentNodePath.node.body.type === 'BlockStatement') {
                    const body = componentNodePath.node.body.body;
                    // Check if const intl = useIntl() already exists
                    let intlExists = false;
                    body.forEach(stmt => {
                        if (stmt.type === 'VariableDeclaration') {
                            stmt.declarations.forEach(decl => {
                                if (decl.id.name === 'intl') intlExists = true;
                            });
                        }
                    });

                    if (!intlExists) {
                        const intlDecl = j.variableDeclaration('const', [
                            j.variableDeclarator(
                                j.identifier('intl'),
                                j.callExpression(j.identifier('useIntl'), [])
                            )
                        ]);
                        body.unshift(intlDecl);
                    }
                }
            }
        });

    if (modified) {
        return root.toSource();
    }
};
