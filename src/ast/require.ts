import * as escodegen from 'escodegen';
import types from '../constants/expressionTypes';
import { parseObjectDestructuringProps, parseASTProperty } from './utils';

interface Tree {
  type: string;
  kind: string;
  declarations: any;
}

const _require = (str: string): string => {
  let name;
  let customName;
  let desctructuredProps;
  for (let i = 0; i < str.length; i += 1) {
    switch (str[i]) {
      case '>': {
        const nodes = str.split('>');
        name = nodes.pop();
        customName = nodes.pop();
        break;
      }
      case ':': {
        const nodes = str.split(':');
        name = nodes.pop();
        desctructuredProps = parseObjectDestructuringProps(nodes.pop());
        break;
      }
    }
  }

  const declaratorID = desctructuredProps
    ? {
        type: types.OBJECT_PATTERN,
        properties: desctructuredProps.map(parseASTProperty)
      }
    : {
        type: types.VARIABLE_DECLARATOR,
        id: {
          type: types.IDENTIFIER,
          name: customName || name
        }
      };

  const tree: Tree = {
    type: types.VARIABLE_DECLARATION,
    kind: 'const',
    declarations: [
      {
        type: types.VARIABLE_DECLARATOR,
        id: declaratorID,
        init: {
          type: types.CALL_EXPRESSION,
          callee: {
            type: types.IDENTIFIER,
            name: 'require'
          },
          arguments: [
            {
              type: types.LITERAL,
              value: name
            }
          ]
        }
      }
    ]
  };

  return escodegen.generate(tree);
};

export default _require;

/* export default function (babel) {
  const { types: t } = babel;
  const no = ['require'];
  
  const modifyProperty = ({ key: { name }}, idx) => {
  	const updatedProp = t.identifier(`\${${idx + 1}:${name}}`);
	  return t.objectProperty(updatedProp, updatedProp, false, true)
  } 
  
  return {
    name: "ast-transform", // not required
    visitor: {
      ObjectPattern(path) {
        const { properties } = path.node;
        path.node.properties = properties.map(modifyProperty);
      }
    }
  };
} */
