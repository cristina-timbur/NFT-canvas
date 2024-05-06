// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

library Counters {
    struct Counter {
        uint256 value;
    }

    function getCurrentValue(Counter storage counter) internal view returns (uint256) {
        return counter.value;
    }

    function increment(Counter storage counter) internal {
        unchecked {
            counter.value += 1;
        }
    }

    function decrement(Counter storage counter) internal {
        require(counter.value > 0, "Counter value can not be decremented!");
        unchecked {
            counter.value -= 1;
        }
    }

    function reset(Counter storage counter) internal {
        counter.value = 0;
    }
}
