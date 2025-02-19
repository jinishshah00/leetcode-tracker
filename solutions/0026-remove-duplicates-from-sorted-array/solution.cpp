class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        vector<int> res;
        int k = 1;
        res.push_back(nums[0]);
        for (int i = 1; i < nums.size(); ++i) {
            if (nums[i] != nums[i-1]) {
                k++;
                res.push_back(nums[i]);
            }
        }
        for (int i = 0; i < k; ++i) {
            nums[i] = res[i];
        }
        return k;
    }
};
