"""
Huffman Coding — Greedy
Builds optimal prefix-free code for data compression.
Time:  O(n log n)
Space: O(n)
"""
import heapq
from typing import Optional
from app.tracer import Tracer, EventType


class HuffmanNode:
    def __init__(self, char: Optional[str], freq: int) -> None:
        self.char = char
        self.freq = freq
        self.left: Optional["HuffmanNode"] = None
        self.right: Optional["HuffmanNode"] = None

    def __lt__(self, other: "HuffmanNode") -> bool:
        return self.freq < other.freq

    def __repr__(self) -> str:
        return f"Node(char={self.char!r}, freq={self.freq})"


def huffman(
    text: str,
    tracer: Tracer,
) -> tuple[dict[str, str], HuffmanNode | None, dict[str, int]]:
    """
    Returns (codes, root, freq_table).
    codes: {char: binary_code}
    """
    if not text:
        tracer.emit(EventType.MESSAGE, "Empty input.")
        return {}, None, {}

    # Frequency table
    freq: dict[str, int] = {}
    for ch in text:
        freq[ch] = freq.get(ch, 0) + 1

    tracer.emit(
        EventType.INITIALIZE,
        f"Huffman Coding for text of length {len(text)}, {len(freq)} unique chars",
        data={"text_length": len(text), "frequencies": freq},
    )

    # Build priority queue
    heap: list[HuffmanNode] = [HuffmanNode(ch, f) for ch, f in freq.items()]
    heapq.heapify(heap)

    tracer.emit(
        EventType.STATE_CHANGE,
        f"Initial heap with {len(heap)} nodes",
        data={"heap": [(n.char, n.freq) for n in heap]},
    )

    while len(heap) > 1:
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)

        tracer.emit(
            EventType.SELECTION,
            f"Pop two smallest: ({left.char!r},{left.freq}) and ({right.char!r},{right.freq})",
            data={"left": (left.char, left.freq), "right": (right.char, right.freq)},
        )

        merged = HuffmanNode(None, left.freq + right.freq)
        merged.left = left
        merged.right = right

        tracer.emit(
            EventType.STATE_CHANGE,
            f"Merge → internal node freq={merged.freq}",
            data={"merged_freq": merged.freq, "heap_size": len(heap) + 1},
        )

        heapq.heappush(heap, merged)

    root = heap[0] if heap else None

    # Generate codes by traversing tree
    codes: dict[str, str] = {}

    def generate_codes(node: Optional[HuffmanNode], prefix: str) -> None:
        if node is None:
            return
        if node.char is not None:
            codes[node.char] = prefix or "0"
            tracer.emit(
                EventType.EDGE_SELECTED,
                f"Code for '{node.char}': {codes[node.char]}",
                data={"char": node.char, "code": codes[node.char], "freq": node.freq},
            )
            return
        generate_codes(node.left, prefix + "0")
        generate_codes(node.right, prefix + "1")

    generate_codes(root, "")

    original_bits = len(text) * 8
    compressed_bits = sum(len(codes[ch]) * freq[ch] for ch in freq)
    ratio = round((1 - compressed_bits / original_bits) * 100, 2) if original_bits > 0 else 0

    tracer.emit(
        EventType.COMPLETE,
        f"Huffman complete. Compression ratio: {ratio}%",
        data={
            "codes": codes,
            "original_bits": original_bits,
            "compressed_bits": compressed_bits,
            "compression_ratio": ratio,
        },
    )
    return codes, root, freq


def huffman_tree_to_dict(node: Optional[HuffmanNode]) -> dict | None:
    """Convert HuffmanNode tree to JSON-serializable dict."""
    if node is None:
        return None
    return {
        "char": node.char,
        "freq": node.freq,
        "left": huffman_tree_to_dict(node.left),
        "right": huffman_tree_to_dict(node.right),
    }
