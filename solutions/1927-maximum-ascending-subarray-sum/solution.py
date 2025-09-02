class Solution:
    def maxAscendingSum(self, numbers: List[int]) -> int:
        current_total = numbers[0]
        max_total = numbers[0]
        for i in range(1, len(numbers)):
            if numbers[i] > numbers[i - 1]:
                current_total += numbers[i]
            else:
                current_total = numbers[i]
            max_total = max(max_total, current_total)

        return max_total

