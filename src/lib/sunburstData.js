import {generate} from "../utils/color.js";

export function buildHierarchy(csv) {
    // Helper function that transforms the given CSV into a hierarchical format.
    const root = { name: "root", children: [], color: null };
    for (let i = 0; i < csv.length; i++) {
        const sequence = csv[i][0];
        const size = +csv[i][1];
        if (isNaN(size)) {
            // e.g. if this is a header row
            continue;
        }
        const parts = sequence.split("-");
        let currentNode = root;
        for (let j = 0; j < parts.length; j++) {
            const children = currentNode["children"];
            const nodeName = parts[j];
            let childNode = null;
            if (j + 1 < parts.length) {
                // Not yet at the end of the sequence; move down the tree.
                let foundChild = false;
                for (let k = 0; k < children.length; k++) {
                    if (children[k]["name"] === nodeName) {
                        childNode = children[k];
                        foundChild = true;
                        break;
                    }
                }
                // If we don't already have a child node for this branch, create it.
                if (!foundChild) {
                    childNode = { name: nodeName, children: [], color: generate() };
                    children.push(childNode);
                }
                currentNode = childNode;
            } else {
                // Reached the end of the sequence; create a leaf node.
                childNode = { name: nodeName, value: size, color: generate() };
                children.push(childNode);
            }
        }
    }
    return root;
}