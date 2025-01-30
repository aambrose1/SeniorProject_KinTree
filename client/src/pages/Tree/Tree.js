import React, { useRef } from 'react';
import * as styles from './styles';
import { ReactComponent as TreeIcon } from '../../assets/background-tree.svg';

const calculateMaxRadius = (node, textRef) => {
  let maxRadius = 20;
  const traverse = (node) => {
    if (textRef.current) {
      const textWidth = textRef.current.getBBox().width;
      maxRadius = Math.max(maxRadius, textWidth / 2 + 10);
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  traverse(node);
  console.log(maxRadius);
  return maxRadius;
};

// TODO: add support for user children
const TreeNode = ({ node, x, y, radius, level }) => {
  const textRef = useRef(null);
  const gap = 100;
  const childY = y - gap;

  return (
    <g>
      <a href={`/account/${node.id}`}>
        <circle cx={x} cy={y} r={radius} style={styles.NodeStyle} />
        {/* TODO: try to move text below node + add in person icon to node (or pfp) */}
        <text ref={textRef} x={x} y={y} dy=".3em" textAnchor="middle" style={styles.TextStyle}>
          {node.name}
        </text>
      </a>
      {node.children && node.children.length > 0 && (
        <g>
          {node.children.map((child, index) => {
            const childX = x + (index - (node.children.length - 1) / 2) * gap;
            return (
              <g key={index}>
                <line
                  x1={x}
                  y1={y - radius}
                  x2={childX}
                  y2={childY + radius}
                  style={styles.LineStyle}
                />
                <TreeNode node={child} x={childX} y={childY} radius={radius} level={level + 1} />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

// sample data for now, but TODO retrieve from API
const treeData = {
  name: "Ronald",
  id: "1",
  children: [
    {
      name: "John",
      id: "2",
      children: []
    },
    {
      name: "Abby",
      children: [
        { name: "Bob", id: "3", children: [] },
        { name: "Paula", id: "4", children: [] }
      ]
    }
  ]
};

function Tree() {
  const user_lastname = "Smith";
  const user_familytree = treeData;

  const width = 800;
  const height = 600;
  const rootX = width / 2;
  const rootY = height - 50;

  let maxRadius = calculateMaxRadius(user_familytree, useRef(null));

  return (
    <div style={styles.DefaultStyle}>
      <h1 style={{marginBottom: "0px"}}>Your Tree</h1>
      <hr  style={{
          color: '#000000',
          backgroundColor: '#000000',
          height: .1,
          width: '40%',
          borderColor : '#000000'
      }}/>
      <h2 style={{fontFamily: "Aboreto", marginTop: "0px"}}>The {user_lastname} Family</h2>

      <div style={styles.svgContainer}>
        <div style={styles.svgWrapper}>
          <svg width={'70vh'} height={'70vh'} style={styles.TreeStyle}>
            <TreeNode node={user_familytree} x={rootX} y={rootY} radius={maxRadius} level={0} />
          </svg>
        </div>
        <TreeIcon style={styles.BackgroundTreeStyle} />
      </div>

    </div>
  );
}

export default Tree;