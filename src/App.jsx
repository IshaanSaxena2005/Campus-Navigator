import React, { useState, useEffect } from 'react';
import {
    Play, RotateCcw, Eraser, Map, Footprints, FastForward,
    Wand2, Navigation, MapPin, BarChart2, X, Sparkles, Loader2, MessageSquare,
    Upload
} from 'lucide-react';

// --- Constants & Configuration ---
const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
const ROWS = 20;
const COLS = 40;
const INITIAL_START = { row: 9, col: 5 };
const INITIAL_FINISH = { row: 9, col: 34 };

// --- Terrain System ---
const TERRAIN = {
    EMPTY: { id: 'EMPTY', cost: 1, label: 'Empty', emoji: '', bg: 'bg-white', border: 'border-slate-100', text: 'text-slate-400' },
    WATER: { id: 'WATER', cost: 3, label: 'Water', emoji: '💧', bg: 'bg-blue-200', border: 'border-blue-400', text: 'text-blue-700' },
    WALL: { id: 'WALL', cost: Infinity, label: 'Wall', emoji: '🧱', bg: 'bg-slate-800', border: 'border-slate-900', text: 'text-white' },
};

const TERRAIN_PAINT_ORDER = ['EMPTY', 'WATER', 'WALL'];

// --- Preset Scenarios ---
const PRESETS = [
    {
        name: 'University Campus',
        icon: '🎓',
        description: 'Buildings, courtyards, and pathways through a university',
        start: { row: 9, col: 1 },
        finish: { row: 9, col: 38 },
        build: () => {
            const cells = {};
            const set = (r, c, t) => { cells[`${r},${c}`] = t; };
            const rect = (r1, c1, r2, c2, t) => { for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) set(r, c, t); };
            rect(1, 3, 6, 10, 'WALL'); rect(1, 14, 6, 21, 'WALL'); rect(1, 25, 6, 32, 'WALL');
            rect(13, 3, 18, 10, 'WALL'); rect(13, 14, 18, 21, 'WALL'); rect(13, 25, 18, 32, 'WALL');
            set(3, 10, 'EMPTY'); set(4, 10, 'EMPTY'); set(3, 14, 'EMPTY'); set(4, 14, 'EMPTY');
            set(3, 21, 'EMPTY'); set(4, 21, 'EMPTY'); set(3, 25, 'EMPTY'); set(4, 25, 'EMPTY');
            set(15, 10, 'EMPTY'); set(16, 10, 'EMPTY'); set(15, 14, 'EMPTY'); set(16, 14, 'EMPTY');
            set(15, 21, 'EMPTY'); set(16, 21, 'EMPTY'); set(15, 25, 'EMPTY'); set(16, 25, 'EMPTY');
            rect(7, 3, 11, 10, 'EMPTY'); rect(7, 14, 11, 21, 'EMPTY'); rect(7, 25, 11, 32, 'EMPTY');
            rect(8, 11, 10, 13, 'EMPTY'); rect(8, 22, 10, 24, 'EMPTY'); rect(7, 33, 11, 38, 'EMPTY');
            rect(8, 17, 10, 19, 'WATER'); rect(1, 33, 18, 38, 'EMPTY'); rect(1, 0, 18, 1, 'EMPTY');
            return cells;
        }
    },
    {
        name: 'City Grid with Traffic',
        icon: '🏙️',
        description: 'Streets, highways, and congested intersections',
        start: { row: 1, col: 1 },
        finish: { row: 18, col: 38 },
        build: () => {
            const cells = {};
            const set = (r, c, t) => { cells[`${r},${c}`] = t; };
            const rect = (r1, c1, r2, c2, t) => { for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) set(r, c, t); };
            const blockRows = [[1, 5], [7, 11], [13, 17]];
            const blockCols = [[1, 7], [10, 16], [19, 25], [28, 34], [37, 39]];
            blockRows.forEach(([r1, r2]) => blockCols.forEach(([c1, c2]) => rect(r1, c1, r2, c2, 'WALL')));
            rect(6, 8, 6, 9, 'WATER'); rect(12, 17, 12, 18, 'WATER'); rect(6, 26, 6, 27, 'WATER'); rect(12, 8, 12, 9, 'WATER');
            rect(0, 19, 5, 25, 'EMPTY'); rect(13, 28, 17, 34, 'EMPTY'); rect(1, 37, 5, 39, 'EMPTY'); rect(13, 0, 17, 0, 'EMPTY');
            return cells;
        }
    },
    {
        name: 'Dense Jungle',
        icon: '🌴',
        description: 'Rivers, forest forest, forest clearing and mud',
        start: { row: 10, col: 0 },
        finish: { row: 10, col: 39 },
        build: () => {
            const cells = {};
            const set = (r, c, t) => { cells[`${r},${c}`] = t; };
            const rect = (r1, c1, r2, c2, t) => { for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) set(r, c, t); };
            rect(0, 0, 19, 39, 'EMPTY');
            rect(0, 5, 7, 8, 'WALL'); rect(0, 12, 4, 15, 'WALL'); rect(12, 5, 19, 8, 'WALL'); rect(15, 12, 19, 15, 'WALL');
            rect(0, 20, 8, 23, 'WALL'); rect(11, 20, 19, 23, 'WALL'); rect(3, 28, 9, 31, 'WALL'); rect(10, 31, 16, 34, 'WALL');
            for (let r = 0; r < ROWS; r++) set(r, 17, 'WATER'); for (let r = 0; r < ROWS; r++) set(r, 18, 'WATER');
            set(10, 17, 'EMPTY'); set(10, 18, 'EMPTY'); set(5, 17, 'EMPTY'); set(5, 18, 'EMPTY'); set(15, 17, 'EMPTY'); set(15, 18, 'EMPTY');
            for (let r = 0; r < ROWS; r++) set(r, 33, 'WATER'); set(10, 33, 'EMPTY'); set(3, 33, 'EMPTY'); set(16, 33, 'EMPTY');
            rect(8, 9, 11, 16, 'EMPTY'); rect(8, 24, 11, 32, 'EMPTY'); rect(5, 9, 8, 11, 'EMPTY'); rect(12, 9, 15, 11, 'EMPTY');
            return cells;
        }
    },
    {
        name: 'River Delta',
        icon: '🌊',
        description: 'Branching waterways, islands, and narrow land bridges',
        start: { row: 10, col: 1 },
        finish: { row: 10, col: 38 },
        build: () => {
            const cells = {};
            const set = (r, c, t) => { cells[`${r},${c}`] = t; };
            const rect = (r1, c1, r2, c2, t) => { for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) set(r, c, t); };
            rect(0, 0, 19, 39, 'WATER');
            rect(0, 0, 19, 3, 'EMPTY'); rect(0, 36, 19, 39, 'EMPTY'); rect(2, 6, 8, 12, 'EMPTY'); rect(11, 6, 17, 12, 'EMPTY');
            rect(2, 16, 17, 22, 'EMPTY'); rect(2, 27, 8, 33, 'EMPTY'); rect(11, 27, 17, 33, 'EMPTY');
            rect(1, 5, 1, 13, 'EMPTY'); rect(9, 5, 9, 13, 'EMPTY'); rect(2, 5, 8, 5, 'EMPTY'); rect(2, 13, 8, 13, 'EMPTY');
            rect(1, 15, 1, 23, 'EMPTY'); rect(18, 15, 18, 23, 'EMPTY');
            rect(9, 3, 10, 6, 'EMPTY'); rect(10, 12, 10, 16, 'EMPTY'); rect(10, 22, 10, 27, 'EMPTY'); rect(10, 33, 10, 36, 'EMPTY'); 
            rect(9, 3, 10, 4, 'EMPTY'); // Fix: changed from set to rect
            return cells;
        }
    },
    {
        name: 'Downtown Metro',
        icon: '🚇',
        description: 'Underground tunnels, train stations, and concrete obstructions',
        start: { row: 2, col: 2 },
        finish: { row: 17, col: 37 },
        build: () => {
            const cells = {};
            const set = (r, c, t) => { cells[`${r},${c}`] = t; };
            const rect = (r1, c1, r2, c2, t) => { for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) set(r, c, t); };
            rect(0, 0, 19, 39, 'WALL');
            rect(2, 0, 2, 39, 'EMPTY'); rect(17, 0, 17, 39, 'EMPTY');
            rect(0, 2, 19, 2, 'EMPTY'); rect(0, 37, 19, 37, 'EMPTY');
            rect(8, 0, 11, 39, 'EMPTY'); rect(8, 10, 11, 30, 'EMPTY');
            rect(2, 10, 17, 12, 'WATER'); rect(10, 10, 10, 12, 'EMPTY');
            rect(2, 28, 17, 30, 'WATER'); rect(10, 28, 10, 30, 'EMPTY');
            return cells;
        }
    },
    {
        name: 'Mountain Pass',
        icon: '🏔️',
        description: 'Winding paths through rocks, mud slides, and alpine streams',
        start: { row: 18, col: 1 },
        finish: { row: 1, col: 38 },
        build: () => {
            const cells = {};
            const set = (r, c, t) => { cells[`${r},${c}`] = t; };
            const rect = (r1, c1, r2, c2, t) => { for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) set(r, c, t); };
            rect(0, 0, 19, 39, 'WALL');
            for (let i = 0; i < 35; i++) {
                const r = 18 - Math.floor(i / 2);
                const c = i + 2;
                rect(r, c, r + 1, c + 1, 'EMPTY');
            }
            rect(10, 5, 15, 15, 'EMPTY');
            rect(5, 20, 10, 35, 'WATER');
            rect(8, 25, 9, 28, 'EMPTY');
            return cells;
        }
    },
    {
        name: 'Suburban Neighborhood',
        icon: '🏡',
        description: 'Houses, manicured lawns, and asphalt roadways',
        start: { row: 0, col: 0 },
        finish: { row: 19, col: 39 },
        build: () => {
            const cells = {};
            const set = (r, c, t) => { cells[`${r},${c}`] = t; };
            const rect = (r1, c1, r2, c2, t) => { for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) set(r, c, t); };
            rect(0, 0, 19, 39, 'EMPTY');
            for (let r = 3; r < 20; r += 5) rect(r, 0, r + 1, 39, 'EMPTY');
            for (let c = 8; c < 40; c += 10) rect(0, c, 19, c + 1, 'EMPTY');
            for (let r = 0; r < 20; r += 5) {
                for (let c = 2; c < 40; c += 10) {
                    rect(r, c, r + 2, c + 4, 'WALL');
                }
            }
            return cells;
        }
    }
];

// --- Helper: Initialize Grid ---
const createNode = (col, row, isStart, isFinish, terrain = 'EMPTY') => ({
    col, row, isStart, isFinish,
    terrain,
    cost: TERRAIN[terrain].cost,
    distance: Infinity, isVisited: false, previousNode: null,
    fScore: Infinity, gScore: Infinity, hScore: 0,
});

const getInitialGrid = (startNode = INITIAL_START, finishNode = INITIAL_FINISH, terrainMap = {}) => {
    const grid = [];
    for (let row = 0; row < ROWS; row++) {
        const currentRow = [];
        for (let col = 0; col < COLS; col++) {
            const isStart = row === startNode.row && col === startNode.col;
            const isFinish = row === finishNode.row && col === finishNode.col;
            // Force start/finish to be reachable (EMPTY)
            const t = (isStart || isFinish) ? 'EMPTY' : (terrainMap[`${row},${col}`] || 'EMPTY');
            currentRow.push(createNode(col, row, isStart, isFinish, t));
        }
        grid.push(currentRow);
    }
    return grid;
};

const manhattanDistance = (node, finishNode) =>
    Math.abs(node.row - finishNode.row) + Math.abs(node.col - finishNode.col);

// --- Pure algorithm runners (return full snapshot history) ---
const runAlgoWithHistory = (algoName, grid) => {
    const g = grid.map(row => row.map(n => ({ ...n, isVisited: false, distance: Infinity, fScore: Infinity, gScore: Infinity, hScore: 0, previousNode: null })));
    let start, finish;
    g.forEach(row => row.forEach(n => { if (n.isStart) start = n; if (n.isFinish) finish = n; }));

    const getNeighbors = (node) => {
        const nb = [];
        const { col, row } = node;
        if (row > 0) nb.push(g[row - 1][col]);
        if (row < ROWS - 1) nb.push(g[row + 1][col]);
        if (col > 0) nb.push(g[row][col - 1]);
        if (col < COLS - 1) nb.push(g[row][col + 1]);
        return nb.filter(n => n.terrain !== 'WALL');
    };

    const steps = [];
    const visited = new Set();
    const snap = (type, node, frontier, desc, pathNodes = []) => steps.push({
        type, node: node ? { row: node.row, col: node.col } : null,
        frontier: frontier.map(n => ({ row: n.row, col: n.col })),
        exploredSoFar: [...visited].map(k => { const [r, c] = k.split(','); return { row: +r, col: +c }; }),
        description: desc,
        pathNodes: pathNodes.map(n => ({ row: n.row, col: n.col })),
    });

    const tracePath = (end) => { const p = []; let cur = end; while (cur) { p.unshift(cur); cur = cur.previousNode; } return p; };
    const terrainNote = (n) => n.terrain !== 'EMPTY' ? ` [${TERRAIN[n.terrain].label}, cost=${TERRAIN[n.terrain].cost}]` : '';

    if (algoName === 'BFS') {
        const queue = [start]; start.isVisited = true; visited.add(`${start.row},${start.col}`);
        while (queue.length > 0) {
            const cur = queue.shift();
            snap('explore', cur, queue, `Dequeued (${cur.row},${cur.col})${terrainNote(cur)}. BFS ignores terrain cost — treats all steps equally.`);
            if (cur === finish) { snap('path', cur, [], `🎯 Goal reached! Note: BFS ignores terrain weights.`, tracePath(finish)); break; }
            for (const nb of getNeighbors(cur)) {
                if (!nb.isVisited) { nb.isVisited = true; nb.previousNode = cur; visited.add(`${nb.row},${nb.col}`); queue.push(nb); }
            }
        }
    } else if (algoName === 'DFS') {
        const stack = [start];
        while (stack.length > 0) {
            const cur = stack.pop();
            if (cur.isVisited) continue;
            cur.isVisited = true; visited.add(`${cur.row},${cur.col}`);
            snap('explore', cur, stack, `Popped (${cur.row},${cur.col})${terrainNote(cur)}. DFS goes deep — ignores terrain cost.`);
            if (cur === finish) { snap('path', cur, [], `🎯 Goal reached! Path may not be optimal.`, tracePath(finish)); break; }
            getNeighbors(cur).reverse().forEach(nb => { if (!nb.isVisited) { nb.previousNode = cur; stack.push(nb); } });
        }
    } else if (algoName === 'Greedy') {
        start.hScore = manhattanDistance(start, finish);
        const open = [start];
        while (open.length > 0) {
            open.sort((a, b) => a.hScore - b.hScore);
            const cur = open.shift();
            if (cur.isVisited) continue;
            cur.isVisited = true; visited.add(`${cur.row},${cur.col}`);
            snap('explore', cur, open, `Picked (${cur.row},${cur.col})${terrainNote(cur)} with h=${cur.hScore}. Greedy ignores terrain cost.`);
            if (cur === finish) { snap('path', cur, [], `🎯 Goal reached! Greedy path found.`, tracePath(finish)); break; }
            getNeighbors(cur).forEach(nb => { if (!nb.isVisited && !open.includes(nb)) { nb.previousNode = cur; nb.hScore = manhattanDistance(nb, finish); open.push(nb); } });
        }
    } else if (algoName === 'Dijkstra') {
        start.gScore = 0;
        const open = [start];
        while (open.length > 0) {
            open.sort((a, b) => a.gScore - b.gScore);
            const cur = open.shift();
            if (cur.isVisited) continue;
            cur.isVisited = true; visited.add(`${cur.row},${cur.col}`);
            snap('explore', cur, open, `Picked (${cur.row},${cur.col})${terrainNote(cur)}: cumulative cost g=${cur.gScore}. Dijkstra fully respects terrain weights.`);
            if (cur === finish) { snap('path', cur, [], `🎯 Goal! Optimal weighted path cost: ${cur.gScore}.`, tracePath(finish)); break; }
            getNeighbors(cur).forEach(nb => {
                const tg = cur.gScore + nb.cost;
                if (tg < nb.gScore) { nb.previousNode = cur; nb.gScore = tg; if (!open.includes(nb)) open.push(nb); }
            });
        }
    } else { // A*
        start.gScore = 0; start.fScore = manhattanDistance(start, finish);
        const open = [start];
        while (open.length > 0) {
            open.sort((a, b) => a.fScore - b.fScore);
            const cur = open.shift();
            if (cur.isVisited) continue;
            cur.isVisited = true; visited.add(`${cur.row},${cur.col}`);
            snap('explore', cur, open, `Picked (${cur.row},${cur.col})${terrainNote(cur)}: g=${cur.gScore} + h=${cur.hScore} = f=${cur.fScore}. A* weighs terrain cost + direction.`);
            if (cur === finish) { snap('path', cur, [], `🎯 Goal reached! Optimal weighted path found.`, tracePath(finish)); break; }
            getNeighbors(cur).forEach(nb => {
                const tg = cur.gScore + nb.cost;
                if (tg < nb.gScore) { nb.previousNode = cur; nb.gScore = tg; nb.hScore = manhattanDistance(nb, finish); nb.fScore = nb.gScore + nb.hScore; if (!open.includes(nb)) open.push(nb); }
            });
        }
    }

    if (!steps.length || steps[steps.length - 1].type !== 'path') {
        steps.push({ type: 'no-path', node: null, frontier: [], exploredSoFar: [...visited].map(k => { const [r, c] = k.split(','); return { row: +r, col: +c }; }), description: '❌ No path found — goal is unreachable.', pathNodes: [] });
    }
    return steps;
};

export default function App() {
    const [grid, setGrid] = useState([]);
    const [mouseIsPressed, setMouseIsPressed] = useState(false);
    const [dragAction, setDragAction] = useState(null);
    const [algorithm, setAlgorithm] = useState('A*');
    const [isRunning, setIsRunning] = useState(false);
    const [stats, setStats] = useState({ visited: 0, pathLength: 0 });
    const [speed, setSpeed] = useState(15);
    const [showComparison, setShowComparison] = useState(false);
    const [comparisonResults, setComparisonResults] = useState([]);
    const [paintTerrain, setPaintTerrain] = useState('WALL');
    const [showPresets, setShowPresets] = useState(false);
    const [activePreset, setActivePreset] = useState(null);

    // AI States
    const [showAiDesigner, setShowAiDesigner] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiImage, setAiImage] = useState(null);
    const [aiImagePreview, setAiImagePreview] = useState(null);
    const [isGeneratingMaze, setIsGeneratingMaze] = useState(false);
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
    const [aiInsights, setAiInsights] = useState('');

    useEffect(() => { setGrid(getInitialGrid()); }, []);

    const loadPreset = (preset) => {
        setIsRunning(false);
        resetNodeStyles();
        setStats({ visited: 0, pathLength: 0 });
        setActivePreset(preset.name);
        setShowPresets(false);
        const terrainMap = preset.build();
        setGrid(getInitialGrid(preset.start, preset.finish, terrainMap));
    };

    // --- Gemini API ---
    const fetchWithRetry = async (url, options, retries = 2) => {
        const delays = [2000, 5000];
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                if (response.status === 429) throw new Error("Rate limit exceeded. Please wait a minute before trying again.");
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(res => setTimeout(res, delays[i]));
            }
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setAiImagePreview(reader.result);
            setAiImage(reader.result.split(',')[1]); // Keep only base64 data for API processing
        };
        reader.readAsDataURL(file);
    };

    const generateAiMaze = async () => {
        if ((!aiPrompt.trim() && !aiImage) || isGeneratingMaze) return;
        setIsGeneratingMaze(true);
        clearPath();
        try {
            const url = "https://api.groq.com/openai/v1/chat/completions";
            
            const messages = [
                {
                    role: "system",
                    content: "You are a terrain map generator. You map user instructions or images onto a grid of 20 rows and 40 columns. Identify pathways as EMPTY, buildings or obstacles as WALL, and water bodies as WATER. Return a JSON object with a 'cells' array where each item is {r, c, terrain}. Terrain must be one of [WALL, WATER, EMPTY]. Return ONLY JSON. Grid size is 20 rows (0-19) and 40 cols (0-39)."
                }
            ];

            const userContent = [];
            if (aiPrompt.trim()) userContent.push({ type: "text", text: aiPrompt });
            if (aiImage) {
                userContent.push({
                    type: "image_url",
                    image_url: { url: `data:image/jpeg;base64,${aiImage}` }
                });
            }
            messages.push({ role: "user", content: userContent });

            const payload = {
                model: aiImage ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile",
                messages,
                response_format: { type: "json_object" },
                temperature: 0.1
            };

            const result = await fetchWithRetry(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload)
            });

            const textResponse = result.choices?.[0]?.message?.content;
            if (textResponse) {
                const data = JSON.parse(textResponse);
                setGrid(prevGrid => {
                    const newGrid = prevGrid.map(row => row.map(n => ({ ...n, terrain: 'EMPTY', cost: 1 })));
                    if (data.cells) data.cells.forEach(({ r, c, terrain }) => {
                        const t = terrain?.toUpperCase();
                        if (r >= 0 && r < ROWS && c >= 0 && c < COLS && TERRAIN[t] && !newGrid[r][c].isStart && !newGrid[r][c].isFinish) {
                            newGrid[r][c].terrain = t;
                            newGrid[r][c].cost = TERRAIN[t].cost;
                        }
                    });
                    return newGrid;
                });
                setShowAiDesigner(false);
                setAiPrompt('');
                setAiImage(null);
                setAiImagePreview(null);
            } else {
                setAiPrompt("AI returned an empty response. Try again.");
            }
        } catch (e) {
            console.error("Groq Error:", e);
            setAiPrompt(`Error: ${e.message || "Connection failed"}. Please verify your Groq key.`);
        } finally {
            setIsGeneratingMaze(false);
        }
    };

    const generateAiInsights = async () => {
        if (isGeneratingInsights || comparisonResults.length === 0) return;
        setIsGeneratingInsights(true);
        try {
            const url = "https://api.groq.com/openai/v1/chat/completions";
            const payload = {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are an AI CS professor. Analyze pathfinding benchmark results on weighted terrain. Give a brief 2-3 sentence explanation of why a specific algorithm won or lost based on informed vs uninformed search and terrain awareness (BFS ignores costs, Dijkstra/A* respect them). Use emojis."
                    },
                    {
                        role: "user",
                        content: `Results: ${JSON.stringify(comparisonResults)}. Provide insights.`
                    }
                ],
                temperature: 0.7
            };

            const result = await fetchWithRetry(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload)
            });

            const text = result.choices?.[0]?.message?.content;
            if (text) setAiInsights(text);
        } catch (e) {
            setAiInsights("Failed to fetch insights.");
        } finally {
            setIsGeneratingInsights(false);
        }
    };

    // --- Grid Interaction ---
    const handleMouseDown = (row, col) => {
        if (isRunning) return;
        const node = grid[row][col];
        let action = 'paint';
        if (node.isStart) action = 'start';
        else if (node.isFinish) action = 'finish';
        setDragAction(action);
        setMouseIsPressed(true);
        if (action === 'paint') paintNode(row, col);
    };

    const handleMouseEnter = (row, col) => {
        if (!mouseIsPressed || isRunning) return;
        if (dragAction === 'start' || dragAction === 'finish') moveSpecialNode(row, col, dragAction);
        else if (dragAction === 'paint') paintNode(row, col);
    };

    const handleMouseUp = () => { setMouseIsPressed(false); setDragAction(null); };

    const paintNode = (row, col) => {
        setGrid(prev => {
            const newGrid = prev.map(r => [...r]);
            const node = newGrid[row][col];
            if (node.isStart || node.isFinish) return prev;
            const t = paintTerrain === 'ERASE' ? 'EMPTY' : paintTerrain;
            newGrid[row][col] = { ...node, terrain: t, cost: TERRAIN[t].cost };
            return newGrid;
        });
    };

    const moveSpecialNode = (row, col, type) => {
        setGrid(prevGrid => {
            const newGrid = prevGrid.map(r => r.map(n => ({ ...n })));
            for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { if (type === 'start') newGrid[r][c].isStart = false; if (type === 'finish') newGrid[r][c].isFinish = false; }
            newGrid[row][col][type === 'start' ? 'isStart' : 'isFinish'] = true;
            if (newGrid[row][col].terrain === 'WALL') {
                newGrid[row][col].terrain = 'EMPTY';
                newGrid[row][col].cost = 1;
            }
            return newGrid;
        });
    };

    // --- Board Controls ---
    const generateRandomMaze = () => {
        if (isRunning) return; clearPath();
        // Weighted towards EMPTY to reduce clutter
        const terrains = [
            'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY',
            'EMPTY', 'EMPTY', 'EMPTY',
            'WATER', 'WALL'
        ];
        setGrid(prev => prev.map(row => row.map(node => {
            if (node.isStart || node.isFinish) return node;
            // 15% fixed wall chance + list randomness
            const t = Math.random() < 0.15 ? 'WALL' : terrains[Math.floor(Math.random() * terrains.length)];
            return { ...node, terrain: t, cost: TERRAIN[t].cost };
        })));
        setActivePreset(null);
    };

    const clearBoard = () => {
        if (isRunning) return;
        let s = INITIAL_START, f = INITIAL_FINISH;
        grid.forEach(row => row.forEach(n => { if (n.isStart) s = { row: n.row, col: n.col }; if (n.isFinish) f = { row: n.row, col: n.col }; }));
        setGrid(getInitialGrid(s, f));
        resetNodeStyles();
        setStats({ visited: 0, pathLength: 0, pathCost: 0 });
        setActivePreset(null);
    };

    const clearPath = () => {
        if (isRunning) return;
        setGrid(prevGrid => prevGrid.map(row => row.map(node => ({ ...node, isVisited: false, distance: Infinity, fScore: Infinity, gScore: Infinity, hScore: 0, previousNode: null }))));
        resetNodeStyles();
        setStats({ visited: 0, pathLength: 0, pathCost: 0 });
    };

    const resetNodeStyles = () => {
        document.querySelectorAll('.grid-node-anim').forEach(el => {
            el.classList.remove(
                'animate-visited', 'animate-path', 
                'bg-sky-300', 'bg-amber-400', 'bg-indigo-600', 'bg-yellow-400', 
                'border-sky-400', 'border-indigo-700', 'border-yellow-500', 
                'z-20'
            );
            // Remove any arbitrary shadow classes that might have been added
            const shadowClass = Array.from(el.classList).find(c => c.startsWith('shadow-['));
            if (shadowClass) el.classList.remove(shadowClass);
        });
    };

    // --- Algorithms (for main visualizer) ---
    const getUnvisitedNeighbors = (node, currentGrid) => {
        const neighbors = [];
        const { col, row } = node;
        if (row > 0) neighbors.push(currentGrid[row - 1][col]);
        if (row < currentGrid.length - 1) neighbors.push(currentGrid[row + 1][col]);
        if (col > 0) neighbors.push(currentGrid[row][col - 1]);
        if (col < currentGrid[0].length - 1) neighbors.push(currentGrid[row][col + 1]);
        return neighbors.filter(n => !n.isVisited && n.terrain !== 'WALL');
    };

    const bfs = (s, f, g) => { 
        if (!s || !f) return [];
        const v = [], q = [s]; s.isVisited = true; 
        while (q.length > 0) { 
            const c = q.shift(); v.push(c); 
            if (c === f) return v; 
            getUnvisitedNeighbors(c, g).forEach(nb => { nb.isVisited = true; nb.previousNode = c; q.push(nb); }); 
        } 
        return v; 
    };
    const dfs = (s, f, g) => { 
        if (!s || !f) return [];
        const v = [], st = [s]; 
        while (st.length > 0) { 
            const c = st.pop(); if (c.isVisited) continue; c.isVisited = true; v.push(c); 
            if (c === f) return v; 
            getUnvisitedNeighbors(c, g).reverse().forEach(nb => { nb.previousNode = c; st.push(nb); }); 
        } 
        return v; 
    };
    const dijkstra = (s, f, g) => { 
        if (!s || !f) return [];
        const v = []; s.gScore = 0; const o = [s]; 
        while (o.length > 0) { 
            o.sort((a, b) => a.gScore - b.gScore); 
            const c = o.shift(); if (c.isVisited) continue; c.isVisited = true; v.push(c); 
            if (c === f) return v; 
            getUnvisitedNeighbors(c, g).forEach(nb => { 
                const t = c.gScore + nb.cost; 
                if (t < nb.gScore) { nb.gScore = t; nb.previousNode = c; if (!o.includes(nb)) o.push(nb); } 
            }); 
        } 
        return v; 
    };
    const greedyBFS = (s, f, g) => { 
        if (!s || !f) return [];
        const v = []; s.hScore = manhattanDistance(s, f); const o = [s]; 
        while (o.length > 0) { 
            o.sort((a, b) => a.hScore - b.hScore); 
            const c = o.shift(); if (c.isVisited) continue; c.isVisited = true; v.push(c); 
            if (c === f) return v; 
            getUnvisitedNeighbors(c, g).forEach(nb => { if (!o.includes(nb)) { nb.previousNode = c; nb.hScore = manhattanDistance(nb, f); o.push(nb); } }); 
        } 
        return v; 
    };
    const astar = (s, f, g) => { 
        if (!s || !f) return [];
        const v = []; s.gScore = 0; s.fScore = manhattanDistance(s, f); const o = [s]; 
        while (o.length > 0) { 
            o.sort((a, b) => a.fScore - b.fScore); 
            const c = o.shift(); if (c.isVisited) continue; c.isVisited = true; v.push(c); 
            if (c === f) return v; 
            getUnvisitedNeighbors(c, g).forEach(nb => { 
                const tg = c.gScore + nb.cost; 
                if (tg < nb.gScore) { nb.previousNode = c; nb.gScore = tg; nb.hScore = manhattanDistance(nb, f); nb.fScore = nb.gScore + nb.hScore; if (!o.includes(nb)) o.push(nb); } 
            }); 
        } 
        return v; 
    };

    const getNodesInShortestPathOrder = (finishNode) => { const path = []; let cur = finishNode; while (cur !== null) { path.unshift(cur); cur = cur.previousNode; } return path; };
    const getPathCost = (path) => path.reduce((sum, n) => sum + (n.isStart ? 0 : n.cost), 0);

    const runComparison = () => {
        if (isRunning) return;
        setAiInsights('');
        const results = [];
        ['A*', 'Dijkstra', 'Greedy', 'BFS', 'DFS'].forEach(algoName => {
            const pg = grid.map(row => row.map(n => ({ ...n, isVisited: false, distance: Infinity, fScore: Infinity, gScore: Infinity, hScore: 0, previousNode: null })));
            let s, f; pg.forEach(row => row.forEach(n => { if (n.isStart) s = n; if (n.isFinish) f = n; }));
            let visited = [];
            if (algoName === 'BFS') visited = bfs(s, f, pg);
            else if (algoName === 'DFS') visited = dfs(s, f, pg);
            else if (algoName === 'Dijkstra') visited = dijkstra(s, f, pg);
            else if (algoName === 'Greedy') visited = greedyBFS(s, f, pg);
            else visited = astar(s, f, pg);
            const path = getNodesInShortestPathOrder(f);
            const pathFound = path.length > 1 && path[0] === s && path[path.length - 1] === f;
            results.push({ 
                name: algoName, 
                explored: visited.length, 
                cost: pathFound ? getPathCost(path) : Infinity, 
                steps: pathFound ? path.length : Infinity 
            });
        });
        setComparisonResults(results);
        setShowComparison(true);
    };

    const visualizeAlgorithm = () => {
        if (isRunning) return;
        clearPath();
        setIsRunning(true);
        const pg = grid.map(row => row.map(n => ({ ...n })));
        let s, f; pg.forEach(row => row.forEach(n => { if (n.isStart) s = n; if (n.isFinish) f = n; }));
        let visited = [];
        if (algorithm === 'BFS') visited = bfs(s, f, pg);
        else if (algorithm === 'DFS') visited = dfs(s, f, pg);
        else if (algorithm === 'Dijkstra') visited = dijkstra(s, f, pg);
        else if (algorithm === 'Greedy') visited = greedyBFS(s, f, pg);
        else visited = astar(s, f, pg);
        const path = getNodesInShortestPathOrder(f);
        const pathFound = path[path.length - 1] === f;
        animate(visited, pathFound ? path : []);
    };

    const animate = (visitedNodesInOrder, nodesInShortestPathOrder) => {
        for (let i = 0; i <= visitedNodesInOrder.length; i++) {
            if (i === visitedNodesInOrder.length) { setTimeout(() => animateShortestPath(nodesInShortestPathOrder), speed * i); return; }
            setTimeout(() => {
                const node = visitedNodesInOrder[i];
                if (!node.isStart && !node.isFinish) { const el = document.getElementById(`node-${node.row}-${node.col}`); if (el) el.classList.add('animate-visited', 'bg-sky-300', 'border', 'border-sky-400'); }
                setStats(prev => ({ ...prev, visited: i + 1 }));
            }, speed * i);
        }
    };

    const animateShortestPath = (nodesInShortestPathOrder) => {
        const cost = getPathCost(nodesInShortestPathOrder);
        for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
            setTimeout(() => {
                const node = nodesInShortestPathOrder[i];
                if (!node.isStart && !node.isFinish) { 
                    const el = document.getElementById(`node-${node.row}-${node.col}`); 
                    if (el) { el.classList.remove('bg-sky-300', 'border-sky-400'); el.classList.add('animate-path', 'bg-yellow-400', 'shadow-[0_0_12px_rgba(250,204,21,0.6)]', 'z-20'); } 
                }
                setStats(prev => ({ ...prev, pathLength: i + 1, pathCost: getPathCost(nodesInShortestPathOrder.slice(0, i + 1)) }));
                if (i === nodesInShortestPathOrder.length - 1) setIsRunning(false);
            }, 35 * i);
        }
        if (nodesInShortestPathOrder.length === 0) setIsRunning(false);
    };

    const getNodeBg = (node) => {
        if (node.terrain === 'WALL') return 'bg-slate-800 border-slate-900 scale-[1.03]';
        if (node.terrain === 'WATER') return 'bg-blue-300 border-blue-400';
        return 'bg-white border-slate-200 hover:border-blue-300';
    };

    const renderGrid = () => (
        <div
            className="bg-white p-2 sm:p-3 rounded-xl shadow-[0_12px_40px_rgb(59,130,246,0.15)] border-2 border-blue-200 touch-none"
            onMouseLeave={handleMouseUp}
        >
            {grid.map((row, rowIdx) => (
                <div key={rowIdx} className="flex">
                    {row.map((node, nodeIdx) => {
                        const { row: r, col: c, isStart, isFinish } = node;

                        let extraClasses = getNodeBg(node);
                        if (isStart) extraClasses = 'bg-emerald-100 border-emerald-400 z-30 cursor-grab';
                        else if (isFinish) extraClasses = 'bg-rose-100 border-rose-400 z-30 cursor-grab';

                        return (
                            <div
                                key={nodeIdx}
                                id={`node-${r}-${c}`}
                                className={`grid-node-anim relative flex items-center justify-center w-[1.05rem] h-[1.05rem] sm:w-[1.35rem] sm:h-[1.35rem] md:w-6 md:h-6 border-2 transition-all duration-150 ${extraClasses}`}
                                onMouseDown={() => handleMouseDown(r, c)}
                                onMouseEnter={() => handleMouseEnter(r, c)}
                                onMouseUp={handleMouseUp}
                                onTouchStart={() => handleMouseDown(r, c)}
                                onTouchMove={(e) => {
                                    e.preventDefault();
                                    const touch = e.touches[0];
                                    const el = document.elementFromPoint(touch.clientX, touch.clientY);
                                    if (el?.id?.startsWith('node-')) {
                                        const [, row, col] = el.id.split('-');
                                        handleMouseEnter(+row, +col);
                                    }
                                }}
                                onTouchEnd={handleMouseUp}
                            >
                                {isStart && <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 fill-emerald-500 rotate-45 -translate-x-px -translate-y-px" />}
                                {isFinish && <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 fill-rose-500" />}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans text-slate-800 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #1e40af 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 shadow-lg z-50 sticky top-0 border-b-4 border-yellow-400">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl shadow-inner ring-2 ring-white/30">
                            <Navigation className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-white leading-tight drop-shadow-lg">Campus Navigator</h1>
                            <p className="text-xs font-semibold text-blue-100 uppercase tracking-widest">AI Pathfinding Visualizer</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                            {/* Preset Scenarios */}
                            <div className="relative group">
                                <button
                                    onClick={() => setShowPresets(!showPresets)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md border-2 ${showPresets ? 'bg-yellow-400 border-yellow-300 text-slate-900' : 'bg-white/95 border-white/50 text-slate-800 hover:bg-white'}`}
                                >
                                    <Map className="w-4 h-4" />
                                    {activePreset || 'Load Scenario'}
                                </button>
                                
                                {showPresets && (
                                    <div className="absolute top-full mt-2 left-0 md:left-auto md:right-0 bg-white rounded-xl shadow-2xl border-2 border-slate-200 p-2 z-[60] w-72">
                                        <div className="text-xs font-black text-slate-500 uppercase px-3 py-2 bg-slate-50 rounded-lg mb-2">Select a Preset</div>
                                        <div className="grid grid-cols-1 gap-1 max-h-96 overflow-y-auto">
                                            {PRESETS.map((p) => (
                                                <button
                                                    key={p.name}
                                                    onClick={() => loadPreset(p)}
                                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-left group border border-transparent hover:border-blue-200"
                                                >
                                                    <span className="text-2xl">{p.icon}</span>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-800 group-hover:text-blue-700">{p.name}</div>
                                                        <div className="text-[10px] leading-tight text-slate-500 font-medium">{p.description}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex bg-white/90 backdrop-blur-sm rounded-lg p-1.5 border-2 border-white/60 shadow-inner">
                                {['A*', 'Dijkstra', 'Greedy', 'BFS', 'DFS'].map((algo) => (
                                    <button key={algo} onClick={() => { if (!isRunning) { setAlgorithm(algo); clearPath(); } }}
                                        className={`px-3.5 py-2 rounded-md text-sm font-bold transition-all duration-200 ${algorithm === algo ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-yellow-400' : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'} ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={isRunning}>{algo}</button>
                                ))}
                            </div>
                            <button onClick={visualizeAlgorithm} disabled={isRunning}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white transition-all shadow-lg border-2 ${isRunning ? 'bg-slate-400 border-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-emerald-400 active:scale-95'}`}>
                                <Play className={`w-4 h-4 ${isRunning ? '' : 'group-hover:fill-white'}`} />
                                {isRunning ? 'Searching...' : 'Start Agent'}
                            </button>
                        </div>
                </div>
            </header>

            {/* Toolbar */}
            <div className="bg-gradient-to-r from-white to-slate-50 border-b-2 border-blue-200 px-4 py-3 flex flex-wrap justify-between items-center text-sm shadow-md gap-3">
                <div className="flex flex-wrap gap-2 items-center font-medium text-slate-700">
                    <button onClick={() => setShowAiDesigner(true)} disabled={isRunning} className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all shadow-md font-bold disabled:opacity-50 border border-purple-400"><Sparkles className="w-4 h-4" /> AI Designer</button>
                    <button onClick={generateRandomMaze} disabled={isRunning} className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg transition-colors font-bold disabled:opacity-50 shadow-md"><Wand2 className="w-4 h-4" /> Random</button>
                    <button onClick={runComparison} disabled={isRunning} className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-lg transition-colors font-bold disabled:opacity-50 shadow-md"><BarChart2 className="w-4 h-4" /> Compare All</button>
                    
                    <div className="w-px h-6 bg-gradient-to-b from-slate-300 to-slate-400 mx-1 hidden sm:block"></div>

                    {/* Terrain Paint Tools */}
                    <div className="flex bg-white rounded-lg p-1.5 border-2 border-slate-300 gap-1 shadow-inner">
                        {TERRAIN_PAINT_ORDER.map(id => {
                            const t = TERRAIN[id];
                            const selected = paintTerrain === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setPaintTerrain(id)}
                                    title={`Paint ${t.label}`}
                                    className={`relative flex items-center justify-center w-9 h-9 rounded-md transition-all ${selected ? `${t.bg} ring-2 ring-blue-600 shadow-lg scale-110` : 'hover:bg-slate-100 text-slate-500'}`}
                                >
                                    <span className="text-lg">{t.emoji || <Eraser className="w-4 h-4" />}</span>
                                    {selected && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 border-2 border-white rounded-full"></div>}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setPaintTerrain('ERASE')}
                            title="Eraser"
                            className={`flex items-center justify-center w-9 h-9 rounded-md transition-all ${paintTerrain === 'ERASE' ? 'bg-white ring-2 ring-blue-600 shadow-lg text-blue-600 scale-110' : 'hover:bg-slate-100 text-slate-500'}`}
                        >
                            <Eraser className="w-4 h-4" />
                        </button>
                    </div>

                    <button onClick={clearBoard} disabled={isRunning} className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg transition-colors font-bold disabled:opacity-50 shadow-md"><RotateCcw className="w-4 h-4" /> Reset</button>
                </div>

                <div className="flex gap-4 font-mono font-bold text-slate-700 bg-gradient-to-br from-slate-100 to-slate-200 px-5 py-2.5 rounded-lg border-2 border-slate-300 shadow-inner">
                    <div className="flex items-center gap-2"><FastForward className="w-4 h-4 text-blue-600" />Explored: <span className="text-blue-700 min-w-[2ch] bg-white px-2 py-0.5 rounded border border-blue-300">{stats.visited}</span></div>
                    <div className="w-px h-4 bg-slate-400 self-center"></div>
                    <div className="flex items-center gap-2"><Footprints className="w-4 h-4 text-emerald-600" />Cost: <span className="text-emerald-700 min-w-[2ch] bg-white px-2 py-0.5 rounded border border-emerald-300">{stats.pathCost || stats.pathLength}</span></div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes visitedAnimation { 0% { transform: scale(0.3); background-color: rgba(67,56,202,0.8); border-radius:100%; } 50% { background-color: rgba(56,189,248,0.8); } 100% { transform: scale(1); background-color: rgba(125,211,252,1); } }
        @keyframes pathAnimation { 0% { transform: scale(0.6); border-radius:50%; } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .animate-visited { animation: visitedAnimation 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        .animate-path { animation: pathAnimation 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
      `}} />

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-auto p-4 z-10">
                <div className="flex flex-col items-center justify-center min-h-full">
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4 text-[10px] sm:text-xs font-bold text-slate-600 bg-gradient-to-r from-white to-blue-50 p-3 sm:px-6 sm:py-3 rounded-xl shadow-lg border-2 border-blue-200 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 text-emerald-600 fill-emerald-200 rotate-45" /> Start</div>
                        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-600 fill-rose-200" /> Goal</div>
                        <div className="hidden sm:block w-px h-3 bg-slate-400"></div>
                        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-slate-800 border-2 border-slate-900"></div> Wall (∞)</div>
                        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-blue-300 border-2 border-blue-400"></div> Water (3)</div>
                        <div className="hidden sm:block w-px h-3 bg-slate-400"></div>
                        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-blue-400 border-2 border-blue-500"></div> Explored</div>
                        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-yellow-400 border-2 border-yellow-500"></div> Path</div>
                    </div>
                    {renderGrid()}
                    <p className="mt-4 text-slate-500 text-xs font-semibold text-center bg-white/70 px-4 py-2 rounded-lg shadow-sm">💡 Drag <strong className="text-emerald-600">Start</strong> and <strong className="text-rose-600">Goal</strong> to move them. Click/drag to draw walls.</p>
                </div>
            </main>

            {/* Comparison Modal */}
            {showComparison && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border-2 border-blue-300">
                        <div className="flex justify-between items-center p-5 border-b-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><BarChart2 className="w-6 h-6 text-blue-600" /> Algorithm Performance Comparison</h2>
                            <button onClick={() => setShowComparison(false)} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-12 gap-4 mb-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <div className="col-span-3 text-left">Algorithm</div>
                                <div className="col-span-4">Efficiency (Explored)</div>
                                <div className="col-span-5">Optimality (Path Cost)</div>
                            </div>
                            <div className="space-y-3">
                                {comparisonResults.map((result, idx) => {
                                    const maxExplored = Math.max(...comparisonResults.map(r => r.explored));
                                    const isBestCost = result.cost !== Infinity && result.cost === Math.min(...comparisonResults.map(r => r.cost));
                                    const isBestExplored = result.explored === Math.min(...comparisonResults.map(r => r.explored));
                                    return (
                                        <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-white p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-md">
                                            <div className="col-span-3 font-extrabold text-slate-700">{result.name}</div>
                                            <div className="col-span-4">
                                                <div className="flex justify-between text-sm mb-1.5">
                                                    <span className="font-bold text-sky-600">{result.explored} <span className="text-[10px] text-slate-400">nodes</span></span>
                                                    {isBestExplored && <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-bold uppercase">Fastest</span>}
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-sky-400 rounded-full transition-all duration-1000" style={{ width: `${(result.explored / maxExplored) * 100}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="col-span-5 pl-4 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`text-lg font-black ${result.cost === Infinity ? 'text-slate-300' : 'text-emerald-600'}`}>
                                                            {result.cost === Infinity ? '∞' : result.cost}
                                                        </div>
                                                        {isBestCost && result.cost !== Infinity && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold uppercase">Optimal</span>}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Total Path Cost</div>
                                                </div>
                                                {result.steps !== Infinity && (
                                                    <div className="text-right">
                                                        <div className="text-xs font-bold text-slate-500">{result.steps} <span className="text-[9px] uppercase">steps</span></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 text-xs text-slate-600 border-t-2 border-blue-200 text-center font-semibold">Comparison based on current grid configuration.</div>
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 border-t-2 border-blue-200">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-black text-blue-900 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-blue-600" /> AI Performance Analyst</h3>
                                {!aiInsights && <button onClick={generateAiInsights} disabled={isGeneratingInsights} className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 disabled:opacity-70 shadow-md">{isGeneratingInsights ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}{isGeneratingInsights ? "Analyzing..." : "Get AI insights"}</button>}
                            </div>
                            {aiInsights && <div className="bg-white p-4 rounded-lg border-2 border-blue-200 text-sm text-blue-900 leading-relaxed shadow-md">{aiInsights}</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* AI Designer Modal */}
            {showAiDesigner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border-2 border-purple-300">
                        <div className="flex justify-between items-center p-5 border-b-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Sparkles className="w-6 h-6 text-purple-600" /> AI Campus Designer</h2>
                            <button onClick={() => setShowAiDesigner(false)} className="p-1.5 text-slate-500 hover:text-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-700 mb-4 font-semibold leading-relaxed">Describe a campus layout or upload a map screenshot. Our Llama 3.2 Vision engine will analyze terrain like <span className="text-blue-700 font-bold">Water</span> and <span className="text-slate-900 font-bold">Walls</span>!</p>
                            
                            <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="e.g., A large central courtyard surrounded by 4 department buildings..."
                                className="w-full h-24 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm text-slate-700 placeholder-slate-400 mb-3" />
                                
                            <div className="flex items-center gap-4 mb-2">
                                <label className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-800 rounded-lg font-bold text-sm cursor-pointer transition-colors border-2 border-purple-300 border-dashed w-full justify-center shadow-sm">
                                    <Upload className="w-4 h-4" />
                                    <span>Upload Map Screenshot</span>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                            </div>
                            
                            {aiImagePreview && (
                                <div className="relative mt-2 rounded-lg overflow-hidden border-2 border-purple-300 shadow-md">
                                    <img src={aiImagePreview} alt="Map Preview" className="w-full max-h-40 object-cover opacity-90" />
                                    <button onClick={() => { setAiImage(null); setAiImagePreview(null); }} className="absolute top-2 right-2 bg-white/95 p-1.5 rounded-md hover:bg-rose-100 hover:text-rose-600 text-slate-700 backdrop-blur-sm shadow-md"><X className="w-4 h-4" /></button>
                                </div>
                            )}

                            <div className="mt-5 flex justify-end gap-3">
                                <button onClick={() => { setShowAiDesigner(false); setAiImage(null); setAiImagePreview(null); setAiPrompt(''); }} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <button onClick={generateAiMaze} disabled={isGeneratingMaze || (!aiPrompt.trim() && !aiImage)} className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg shadow-md disabled:opacity-50 flex items-center gap-2 border border-purple-400">
                                    {isGeneratingMaze ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    {isGeneratingMaze ? "Generating..." : "Generate with AI"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
