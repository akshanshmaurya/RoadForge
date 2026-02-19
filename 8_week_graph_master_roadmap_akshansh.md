# 8-Week Graph Mastery + Full DSA Revision Roadmap
**Target**: 70–80 Graph Problems + Core DSA Revision  
**Weekday Time**: ~2 hours  
**Weekend Time**: ~4 hours  
**Goal**: Remove fear of graphs, build pattern recognition, become placement-ready.

---

# How to Use This Plan (Important)
Each weekday session (2 hours):

**Block 1 (75–90 min)**
- Graph problem(s)
- 30 min per problem max
- If stuck → read hint, not full solution

**Block 2 (30–40 min)**
- Revision of non-graph DSA topic
- Solve 1 revision problem

Weekend (4 hours):
- 2–3 Graph problems
- 1 full Graph revision problem (no help)
- 2 DSA revision problems

---

# Graph Pattern Decision Tree (Memorize)
When reading a problem:

Grid traversal → BFS/DFS  
Connectivity/components → DFS or DSU  
Dependencies/order → Topological Sort  
Unweighted shortest path → BFS  
Weighted shortest path → Dijkstra  
Minimum connection → MST (Kruskal/Prim)

---

# Core Templates You Must Know

## BFS (Graph/Grid)
```java
Queue<int[]> q = new LinkedList<>();
boolean[][] vis = new boolean[n][m];
q.offer(new int[]{sr, sc});
vis[sr][sc] = true;

while(!q.isEmpty()){
    int[] cur = q.poll();
    for(int[] d : dirs){
        int nr = cur[0] + d[0];
        int nc = cur[1] + d[1];
        if(nr>=0 && nc>=0 && nr<n && nc<m && !vis[nr][nc]){
            vis[nr][nc] = true;
            q.offer(new int[]{nr,nc});
        }
    }
}
```

## DFS
```java
void dfs(int node, List<List<Integer>> adj, boolean[] vis){
    vis[node] = true;
    for(int nei : adj.get(node)){
        if(!vis[nei]) dfs(nei, adj, vis);
    }
}
```

## Union Find (DSU)
```java
int find(int x){
    if(parent[x]!=x) parent[x]=find(parent[x]);
    return parent[x];
}

void union(int a,int b){
    int pa=find(a), pb=find(b);
    if(pa!=pb) parent[pa]=pb;
}
```

## Dijkstra
```java
PriorityQueue<int[]> pq = new PriorityQueue<>((a,b)->a[1]-b[1]);
pq.offer(new int[]{src,0});

while(!pq.isEmpty()){
    int[] cur=pq.poll();
    int node=cur[0], dist=cur[1];
    for(int[] nei:adj.get(node)){
        int next=nei[0], w=nei[1];
        if(dist+w < distance[next]){
            distance[next]=dist+w;
            pq.offer(new int[]{next,distance[next]});
        }
    }
}
```

---

# WEEK 1 – Grid BFS/DFS (Fear Removal)
DSA Revision Topic: Arrays + Sliding Window

Day 1
- LC 200: https://leetcode.com/problems/number-of-islands/
- LC 733: https://leetcode.com/problems/flood-fill/
Revision: LC 53 (Maximum Subarray)

Day 2
- LC 695: Max Area of Island
- LC 463: Island Perimeter
Revision: LC 121 (Best Time to Buy Sell Stock)

Day 3
- LC 994: Rotten Oranges
Revision: LC 209 (Min Size Subarray Sum)

Day 4
- LC 130: Surrounded Regions
Revision: LC 3 (Longest Substring Without Repeating)

Day 5
- LC 542: 01 Matrix
Revision: LC 239 (Sliding Window Maximum)

Weekend
- LC 1091: Shortest Path in Binary Matrix
- Revision: Number of Islands (no help)
DSA: Two Sum, Container With Most Water

---

# WEEK 2 – Graph Traversal (Adjacency)
DSA Revision: HashMap + Prefix Sum

Day 1
- LC 547: Number of Provinces
Revision: LC 560

Day 2
- LC 841: Keys and Rooms
Revision: LC 525

Day 3
- LC 1971: Find if Path Exists
Revision: LC 974

Day 4
- LC 133: Clone Graph
Revision: LC 1

Day 5
- LC 797: All Paths From Source to Target
Revision: LC 49 (Group Anagrams)

Weekend
- LC 417: Pacific Atlantic Water Flow
- Revision: Clone Graph
DSA: Subarray Sum Equals K, Longest Consecutive Sequence

---

# WEEK 3 – Topological Sort + Cycle Detection
DSA Revision: Stack + Monotonic Stack

Day 1
- LC 207: Course Schedule
Revision: LC 20

Day 2
- LC 210: Course Schedule II
Revision: LC 739

Day 3
- LC 684: Redundant Connection
Revision: LC 496

Day 4
- LC 802: Eventual Safe States
Revision: LC 84

Day 5
- LC 310: Minimum Height Trees
Revision: LC 42

Weekend
- LC 1136: Parallel Courses
- Revision: Course Schedule II
DSA: Daily Temperatures, Largest Rectangle

---

# WEEK 4 – Union Find Mastery
DSA Revision: Binary Search

Day 1
- LC 323: Connected Components
Revision: LC 704

Day 2
- LC 721: Accounts Merge
Revision: LC 35

Day 3
- LC 261: Graph Valid Tree
Revision: LC 875

Day 4
- LC 947: Most Stones Removed
Revision: LC 153

Day 5
- LC 990: Satisfiability of Equations
Revision: LC 162

Weekend
- Revision: Accounts Merge
- Random DSU problem
DSA: Search in Rotated Array

---

# WEEK 5 – Shortest Path (BFS vs Dijkstra)
DSA Revision: Heap/Priority Queue

Day 1
- LC 743: Network Delay Time
Revision: LC 215

Day 2
- LC 787: Cheapest Flights
Revision: LC 347

Day 3
- LC 778: Swim in Rising Water
Revision: LC 973

Day 4
- LC 1631: Path With Minimum Effort
Revision: LC 295

Day 5
- LC 505: Maze II
Revision: LC 23

Weekend
- Revision: Network Delay Time
- Random shortest path problem
DSA: Top K Elements problems

---

# WEEK 6 – Minimum Spanning Tree
DSA Revision: Linked List

Day 1
- LC 1584: Min Cost to Connect Points
Revision: LC 206

Day 2
- LC 1135: Connecting Cities
Revision: LC 21

Day 3
- LC 1168: Optimize Water Distribution
Revision: LC 19

Day 4
- MST revision (Kruskal template)
Revision: LC 141

Day 5
- Random MST problem
Revision: LC 142

Weekend
- Full MST revision
DSA: Reverse Linked List II

---

# WEEK 7 – Advanced Graph (Graph + Other Techniques)
DSA Revision: Trees

Day 1
- LC 399: Evaluate Division
Revision: LC 104

Day 2
- LC 815: Bus Routes
Revision: LC 102

Day 3
- LC 1345: Jump Game IV
Revision: LC 236

Day 4
- LC 433: Minimum Genetic Mutation
Revision: LC 124

Day 5
- LC 1466: Reorder Routes
Revision: LC 98

Weekend
- 3 Random Graph Mediums (timed)
DSA: BST problems

---

# WEEK 8 – Interview Simulation
DSA Revision: Mixed

Daily (1 Graph timed – 30 min max)
Pick from Graph tag Medium

Must redo:
- LC 200
- LC 207
- LC 721
- LC 743
- LC 1584

Weekend Final Test
Solve without help:
- Number of Islands
- Course Schedule
- Accounts Merge
- Network Delay Time
- Cheapest Flights

---

# Time Complexity Knowledge (Must Know)
DFS/BFS: O(V + E)  
DSU: ~O(α(n))  
Dijkstra: O(E log V)  
Topological: O(V + E)  
Kruskal: O(E log E)

---

# Final Outcome After 8 Weeks
You will have:
- ~75 Graph problems
- All major patterns
- Graph + DSU + DP + Binary Search combinations exposure
- Placement-level confidence

If followed strictly, Graphs will stop feeling like a topic. They will feel like a pattern recognition exercise.

