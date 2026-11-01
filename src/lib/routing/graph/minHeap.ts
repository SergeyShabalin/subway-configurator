export class MinHeap {
  private nodes: Array<string> = []
  private keys: Array<number> = []

  get size(): number {
    return this.nodes.length
  }

  push(node: string, key: number): void {
    let i = this.nodes.length
    this.nodes.push(node)
    this.keys.push(key)

    while (i > 0) {
      const parent = (i - 1) >> 1
      if (this.keys[parent] <= key) break
      this.nodes[i] = this.nodes[parent]
      this.keys[i] = this.keys[parent]
      i = parent
    }

    this.nodes[i] = node
    this.keys[i] = key
  }

  pop(): { node: string; key: number } | undefined {
    const size = this.nodes.length
    if (size === 0) return undefined

    const top = { node: this.nodes[0], key: this.keys[0] }
    const lastNode = this.nodes.pop() as string
    const lastKey = this.keys.pop() as number
    const n = size - 1

    if (n > 0) {
      let i = 0

      while (true) {
        let child = 2 * i + 1
        if (child >= n) break
        if (child + 1 < n && this.keys[child + 1] < this.keys[child]) child++
        if (this.keys[child] >= lastKey) break

        this.nodes[i] = this.nodes[child]
        this.keys[i] = this.keys[child]
        i = child
      }

      this.nodes[i] = lastNode
      this.keys[i] = lastKey
    }

    return top
  }
}
