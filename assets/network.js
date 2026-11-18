
// Block 3-V：往後若要用 vibe coding 增加互動功能，可從這個檔案修改。
(() => {
  const data = JSON.parse(document.getElementById('network-data').textContent);
  const metricSelect = document.getElementById('metric-select');
  const metricTitle = document.getElementById('metric-title');
  const infoBox = document.getElementById('selected-info');
  const names = { degree: 'Degree Centrality', betweenness: 'Betweenness Centrality', eigenvector: 'Eigenvector Centrality' };
  const originalNodes = data.nodes;
  const rawValues = (metric) => originalNodes.map(node => Number(node[metric]) || 0);

  // 依目前指標的最小值與最大值，將節點大小縮放到 14～48。
  function nodeSize(node, metric) {
    const values = rawValues(metric);
    const low = Math.min(...values);
    const high = Math.max(...values);
    const normalized = high === low ? 0.5 : (node[metric] - low) / (high - low);
    return 14 + normalized * 34;
  }

  const nodes = new vis.DataSet(originalNodes.map(node => ({
    ...node, size: nodeSize(node, 'degree'),
    title: `${node.label}\nDegree: ${node.degree.toFixed(3)}\nBetweenness: ${node.betweenness.toFixed(3)}\nEigenvector: ${node.eigenvector.toFixed(3)}`
  })));
  const edges = new vis.DataSet(data.edges);
  const network = new vis.Network(document.getElementById('network'), { nodes, edges }, {
    autoResize: true,
    physics: false,
    interaction: { dragNodes:true, dragView:true, zoomView:true, hover:true },
    nodes: { shape:'dot', borderWidth:1.5, color:{ background:'#4d91c5', border:'#8bc9ef', highlight:{background:'#ffc16e',border:'#ffe3ad'} }, font:{ size:15, color:'#f2f6fc', strokeWidth:3, strokeColor:'#080d15' } },
    edges: { color:{color:'#7f99b2',highlight:'#c9e2f7'}, width:1.4, smooth:false }
  });

  function displaySelection(nodeId) {
    const node = originalNodes.find(n => n.id === nodeId);
    if (!node) { infoBox.textContent = '點選節點可以查看其分數。'; return; }
    infoBox.textContent = `${node.label}｜${names[metricSelect.value]}：${Number(node[metricSelect.value]).toFixed(3)}`;
  }

  // 只修改節點大小，不重新建立 network，維持節點座標。
  metricSelect.addEventListener('change', () => {
    const metric = metricSelect.value;
    metricTitle.textContent = names[metric];
    nodes.update(originalNodes.map(node => ({ id:node.id, size:nodeSize(node, metric) })));
    const selected = network.getSelectedNodes();
    if (selected.length) displaySelection(selected[0]);
  });
  // 節點聚焦：顯示被點選的節點、直接鄰居，及兩端皆可見的邊。
  // 使用 hidden 而不刪除資料，方便切換指標和還原網絡。
  function focusOn(nodeId) {
    const visible = new Set([nodeId, ...network.getConnectedNodes(nodeId)]);
    nodes.update(originalNodes.map(node => ({ id: node.id, hidden: !visible.has(node.id) })));
    edges.update(data.edges.map(edge => ({
      id: edge.id, hidden: !(visible.has(edge.from) && visible.has(edge.to))
    })));
    displaySelection(nodeId);
  }

  function showAll() {
    nodes.update(originalNodes.map(node => ({ id: node.id, hidden: false })));
    edges.update(data.edges.map(edge => ({ id: edge.id, hidden: false })));
    displaySelection(null);
  }

  network.on('click', params => {
    if (params.nodes.length) focusOn(params.nodes[0]);
    else showAll();
  });
})();
