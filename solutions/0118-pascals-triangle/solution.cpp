class Solution {
public:
    vector<vector<int>> generate(int numRows) {
        vector<vector<int>> res(numRows);
        for (int i = 1; i < (numRows+1); ++i) {
            for (int j = 0; j < i; ++j) {
                if (j == 0 || j == i-1){
                    res[i-1].push_back(1);
                } else {
                    res[i-1].push_back(res[i-2][j-1] + res[i-2][j]); 
                }
            }
        }
        return res;
    }
};
