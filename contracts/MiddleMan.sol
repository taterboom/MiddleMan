// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25 <0.9.0;
pragma experimental ABIEncoderV2;

contract MiddleMan {
    struct Order {
        // 订单类型
        uint256 id;
        address receiver;
        uint256 amount;
        string remark;
        bool finished;
        uint256 created_at;
        uint256 finished_at;
    }

    uint256 internal_order_id = 1; // 自增orderId
    mapping(address => mapping(uint256 => Order)) public orders; // 发起者的订单
    mapping(address => uint256[]) public senderOrderIdList; // 发起者的订单id列表
    // address admin; // 管理员(创建合约的人)

    event CreateOrder(
        uint256 indexed id,
        address indexed sender,
        address indexed receiver,
        string remark,
        uint256 amount
    );
    event ExecuteOrder(
        uint256 indexed id,
        address indexed sender,
        address indexed receiver,
        string remark,
        uint256 amount
    );

    constructor() {
        // admin = msg.sender;
    }

    function createOrder(address receiver, string calldata remark)
        external
        payable
    {
        uint256 id = internal_order_id++;
        Order memory order = Order({
            id: id,
            receiver: receiver,
            amount: msg.value,
            remark: remark,
            finished: false,
            created_at: block.timestamp,
            finished_at: 0
        });
        senderOrderIdList[msg.sender].push(id);
        orders[msg.sender][id] = order;
        emit CreateOrder(id, msg.sender, receiver, remark, msg.value);
    }

    function executeOrder(uint256 orderId) public {
        Order storage toBeExecutedOrder = orders[msg.sender][orderId];
        require(toBeExecutedOrder.id > 0, "no order found");
        require(!toBeExecutedOrder.finished, "order has finished");
        payable(toBeExecutedOrder.receiver).transfer(toBeExecutedOrder.amount);
        toBeExecutedOrder.finished = true;
        toBeExecutedOrder.finished_at = block.timestamp;

        emit ExecuteOrder(
            toBeExecutedOrder.id,
            msg.sender,
            toBeExecutedOrder.receiver,
            toBeExecutedOrder.remark,
            toBeExecutedOrder.amount
        );
    }

    function getSenderOrderList(address addr)
        public
        view
        returns (Order[] memory)
    {
        uint256[] memory orderIdList = senderOrderIdList[addr];
        Order[] memory orderList = new Order[](orderIdList.length);
        for (uint256 i = 0; i < orderIdList.length; i++) {
            orderList[i] = orders[addr][orderIdList[i]];
        }
        return orderList;
    }

    fallback() external payable {
        uint256 id = internal_order_id++;
        Order memory order = Order({
            id: id,
            receiver: address(0),
            amount: msg.value,
            remark: "unknown",
            finished: false,
            created_at: block.timestamp,
            finished_at: 0
        });
        orders[msg.sender][id] = order;
        senderOrderIdList[msg.sender].push(id);
        emit CreateOrder(id, msg.sender, address(0), "unknown", msg.value);
    }
}
