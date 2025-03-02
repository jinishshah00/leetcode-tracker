class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> m;
        vector<int> res = {-1, -1};
        for (int i = 0; i < nums.size(); ++i) {
            int diff = target - nums[i];
            if (m.find(diff) != m.end()) {
                res = {i, m.at(diff)};
                return res;
            }
            m.insert({nums[i], i});
        }
        return res;
    }
};
