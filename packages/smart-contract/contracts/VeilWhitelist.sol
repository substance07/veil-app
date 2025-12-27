// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, ebool, eaddress, externalEaddress } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

error CampaignNotFound();
error NotCampaignOwner();
error ZeroAddress();
error EmptyBatch();
error SenderNotAllowed();
error RangeOrder();
error OutOfBounds();

contract VeilWhitelist is ZamaEthereumConfig {
    struct Campaign {
        address owner;
        bool exists;
        string name;
    }

    uint256 public campaignCount;

    mapping(uint256 => Campaign) public campaigns;

    mapping(uint256 => mapping(uint256 => eaddress)) private _wl;

    mapping(uint256 => uint256) public wlSize;

    mapping(uint256 => mapping(address => ebool)) private _lastCheck;

    event CampaignCreated(uint256 indexed campaignId, address indexed owner, string name);
    event CampaignOwnershipTransferred(uint256 indexed campaignId, address indexed prevOwner, address indexed newOwner);

    event WhitelistAdded(uint256 indexed campaignId, uint256 count);
    event WhitelistRemoved(uint256 indexed campaignId, uint256 index);
    event WhitelistCleared(uint256 indexed campaignId);

    modifier campaignExists(uint256 campaignId) {
        if (!campaigns[campaignId].exists) revert CampaignNotFound();
        _;
    }

    modifier onlyCampaignOwner(uint256 campaignId) {
        if (msg.sender != campaigns[campaignId].owner) revert NotCampaignOwner();
        _;
    }

    function createCampaign(string calldata name) external returns (uint256 campaignId) {
        campaignId = ++campaignCount;

        campaigns[campaignId] = Campaign({
            owner: msg.sender,
            exists: true,
            name: name
        });

        emit CampaignCreated(campaignId, msg.sender, name);
    }

    function transferCampaignOwnership(uint256 campaignId, address newOwner)
        external
        campaignExists(campaignId)
        onlyCampaignOwner(campaignId)
    {
        if (newOwner == address(0)) revert ZeroAddress();
        emit CampaignOwnershipTransferred(campaignId, campaigns[campaignId].owner, newOwner);
        campaigns[campaignId].owner = newOwner;
    }

    function addWhitelist(
        uint256 campaignId,
        externalEaddress[] calldata addrsCt,
        bytes calldata attestation
    )
        external
        campaignExists(campaignId)
        onlyCampaignOwner(campaignId)
    {
        uint256 n = addrsCt.length;
        if (n == 0) revert EmptyBatch();

        uint256 size = wlSize[campaignId];

        for (uint256 i = 0; i < n; ++i) {
            eaddress a = FHE.fromExternal(addrsCt[i], attestation);

            FHE.allowThis(a);

            _wl[campaignId][size] = a;
            ++size;
        }

        wlSize[campaignId] = size;
        emit WhitelistAdded(campaignId, n);
    }

    function checkAccessAll(
        uint256 campaignId,
        externalEaddress userAddrCt,
        bytes calldata attestation
    )
        external
        campaignExists(campaignId)
        returns (ebool)
    {
        return _check(campaignId, userAddrCt, attestation, 0, wlSize[campaignId]);
    }

    function checkAccessRange(
        uint256 campaignId,
        externalEaddress userAddrCt,
        bytes calldata attestation,
        uint256 start,
        uint256 end
    )
        external
        campaignExists(campaignId)
        returns (ebool)
    {
        if (start > end) revert RangeOrder();
        if (end > wlSize[campaignId]) revert OutOfBounds();
        return _check(campaignId, userAddrCt, attestation, start, end);
    }

    function _check(
        uint256 campaignId,
        externalEaddress userAddrCt,
        bytes calldata attestation,
        uint256 start,
        uint256 end
    ) internal returns (ebool) {
        eaddress userAddr = FHE.fromExternal(userAddrCt, attestation);

        if (!FHE.isSenderAllowed(userAddr)) revert SenderNotAllowed();

        ebool found = FHE.asEbool(false);
        for (uint256 i = start; i < end; ++i) {
            found = FHE.or(found, FHE.eq(_wl[campaignId][i], userAddr));
        }

        found = FHE.makePubliclyDecryptable(found);

        _lastCheck[campaignId][msg.sender] = found;

        return found;
    }

    function getMyLastCheck(uint256 campaignId)
        external
        view
        campaignExists(campaignId)
        returns (ebool)
    {
        return _lastCheck[campaignId][msg.sender];
    }

    function removeWhitelistAt(uint256 campaignId, uint256 index)
        external
        campaignExists(campaignId)
        onlyCampaignOwner(campaignId)
    {
        uint256 size = wlSize[campaignId];
        if (size == 0) revert OutOfBounds();
        if (index >= size) revert OutOfBounds();

        uint256 last = size - 1;

        if (index != last) {
            _wl[campaignId][index] = _wl[campaignId][last];
        }

        wlSize[campaignId] = last;
        emit WhitelistRemoved(campaignId, index);
    }

    function removeWhitelistBatch(uint256 campaignId, uint256[] calldata indices)
        external
        campaignExists(campaignId)
        onlyCampaignOwner(campaignId)
    {
        uint256 size = wlSize[campaignId];
        if (size == 0) revert OutOfBounds();
        if (indices.length == 0) revert EmptyBatch();

        for (uint256 i = 0; i < indices.length; ++i) {
            uint256 idx = indices[i];
            if (idx >= size) revert OutOfBounds();

            uint256 last = size - 1;
            if (idx != last) {
                _wl[campaignId][idx] = _wl[campaignId][last];
            }

            --size;
            emit WhitelistRemoved(campaignId, idx);
        }

        wlSize[campaignId] = size;
    }

    function clearWhitelist(uint256 campaignId)
        external
        campaignExists(campaignId)
        onlyCampaignOwner(campaignId)
    {
        wlSize[campaignId] = 0;
        emit WhitelistCleared(campaignId);
    }

    function getEncryptedWhitelistAt(uint256 campaignId, uint256 i)
        external
        view
        campaignExists(campaignId)
        onlyCampaignOwner(campaignId)
        returns (eaddress)
    {
        if (i >= wlSize[campaignId]) revert OutOfBounds();
        return _wl[campaignId][i];
    }

    function getCampaignInfo(uint256 campaignId)
        external
        view
        returns (address owner, bool exists, string memory name, uint256 whitelistSize)
    {
        Campaign memory campaign = campaigns[campaignId];
        return (campaign.owner, campaign.exists, campaign.name, wlSize[campaignId]);
    }

    function isCampaignOwner(uint256 campaignId, address account)
        external
        view
        returns (bool)
    {
        return campaigns[campaignId].exists && campaigns[campaignId].owner == account;
    }
}
