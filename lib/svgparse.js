function SVGParser () {}


SVGParser.prototype.elementNode = function(node) {
  return node.nodeType == Node.ELEMENT_NODE;
}

SVGParser.prototype.parse_attr_x = parseFloat;
SVGParser.prototype.parse_attr_y = parseFloat;
SVGParser.prototype.parse_attr_r = parseFloat;
SVGParser.prototype.parse_attr_rx = parseFloat;
SVGParser.prototype.parse_attr_ry = parseFloat;
SVGParser.prototype.parse_attr_cx = parseFloat;
SVGParser.prototype.parse_attr_cy = parseFloat;
SVGParser.prototype.parse_attr_height = parseFloat;
SVGParser.prototype.parse_attr_width = parseFloat;
SVGParser.prototype.parse_attr_style = function(val) {
  let styleProps = {};
  val.split(";").forEach(param => {
    const p = param.split(":");
    styleProps[p[0]] = p[1];
  });
  return styleProps;
}
SVGParser.prototype.parse_attr_transform = function(str) {
  const s = str.indexOf('(');
  const e = str.lastIndexOf(')');
  return {
    type: str.slice(0, s),
    parameters: str.slice(s+1, e).split(',').map(parseFloat)
  };
}
SVGParser.prototype.parse_attr_d = function(str) {
  const seq = str.split(" ");
  const shape = [];
  const cursor = new Vector(0, 0);
  let i = 0;
  while (i < seq.length) {
    const p =  i+1 != seq.length ? seq[i+1].split(',').map(parseFloat) : [];
    switch (seq[i]) {
      case "M": cursor.reset(p[0], p[1]); break;
      case "m": cursor.addVec({x: p[0], y: p[1]}); break;
      case "L": shape.push(cursor); cursor.reset(p[0], p[1]); break;
      case "l": shape.push(cursor); cursor.addVec({x: p[0], y: p[1]}); break;
      case "H": shape.push(cursor); cursor.x = p[0]; break;
      case "h": shape.push(cursor); cursor.x += p[0]; break;
      case "V": shape.push(cursor); cursor.y = p[0]; break;
      case "v": shape.push(cursor); cursor.y += p[0]; break;
      case "Z": shape.push(cursor); cursor = shape[0]; break;
      default: console.log('skipping "' + seq[i] + '": not implemented.');
    }
    i+= p.length == 0 ? 1 : 2;
  };
  shape.push(cursor);
  return shape;
}
SVGParser.prototype.parse_attribute = function(attr) {
  let funcName = "parse_attr_" + attr.nodeName;
  let f = SVGParser.prototype[funcName];
  return !f ? attr.textContent : f(attr.textContent);
}

SVGParser.prototype.parse_node = function(node) {
  let out = {};

  Array.prototype.forEach.call(node.attributes, attr => {
      out[attr.nodeName] = SVGParser.prototype.parse_attribute(attr);
  });

  Array.prototype.filter.call(node.childNodes, SVGParser.prototype.elementNode)
    .forEach(node => { if (!out[node.nodeName]) out[node.nodeName] = [];
      out[node.nodeName].push(SVGParser.prototype.parse_node(node));
    });

  return out;
}

SVGParser.prototype.parseSVGXML = function(doc) {
  return {
    svg: Array.prototype.filter
          .call(doc.childNodes, SVGParser.prototype.elementNode)
          .map(SVGParser.prototype.parse_node)
  };
}
