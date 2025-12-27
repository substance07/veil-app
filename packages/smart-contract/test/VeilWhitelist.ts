import { FhevmType } from "@fhevm/hardhat-plugin";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";

import { VeilWhitelist, VeilWhitelist__factory } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

describe("VeilWhitelist", function () {
  let signers: Signers;
  let veilWhitelist: VeilWhitelist;
  let veilWhitelistAddress: string;

  before(async function () {
    if (!fhevm.isMock) {
      throw new Error("This hardhat test suite cannot run on Sepolia Testnet");
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      charlie: ethSigners[3],
    };

    veilWhitelist = (await (
      await new VeilWhitelist__factory(signers.deployer).deploy()
    ).waitForDeployment()) as VeilWhitelist;
    veilWhitelistAddress = await veilWhitelist.getAddress();

    console.log("VeilWhitelist deployed at:", veilWhitelistAddress);
  });

  describe("Campaign Management", function () {
    it("Should create a campaign", async function () {
      const tx = await veilWhitelist.connect(signers.deployer).createCampaign("Test Campaign");
      const receipt = await tx.wait();

      const event = receipt?.logs
        .map((log) => {
          try {
            return veilWhitelist.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e) => e && e.name === "CampaignCreated");

      expect(event).to.not.be.null;
      if (event && event.args) {
        expect(event.args[1]).to.equal(signers.deployer.address);
        expect(event.args[2]).to.equal("Test Campaign");
      }
    });

    it("Should get campaign info", async function () {
      const info = await veilWhitelist.getCampaignInfo(1);
      expect(info.exists).to.be.true;
      expect(info.owner).to.equal(signers.deployer.address);
      expect(info.name).to.equal("Test Campaign");
      expect(info.whitelistSize).to.equal(0n);
    });

    it("Should transfer campaign ownership", async function () {
      await veilWhitelist.connect(signers.deployer).transferCampaignOwnership(1, signers.alice.address);

      const info = await veilWhitelist.getCampaignInfo(1);
      expect(info.owner).to.equal(signers.alice.address);
    });

    it("Should revert when non-owner tries to transfer ownership", async function () {
      await expect(
        veilWhitelist.connect(signers.bob).transferCampaignOwnership(1, signers.bob.address),
      ).to.be.revertedWithCustomError(veilWhitelist, "NotCampaignOwner");
    });

    it("Should revert when transferring to zero address", async function () {
      await expect(
        veilWhitelist.connect(signers.alice).transferCampaignOwnership(1, ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(veilWhitelist, "ZeroAddress");
    });
  });

  describe("Whitelist Management", function () {
    let campaignId: bigint;

    before(async function () {
      const tx = await veilWhitelist.connect(signers.deployer).createCampaign("Whitelist Test");
      const receipt = await tx.wait();
      const event = receipt?.logs
        .map((log) => {
          try {
            return veilWhitelist.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e) => e && e.name === "CampaignCreated");

      if (event && event.args) {
        campaignId = event.args[0];
      }
    });

    it("Should add addresses to whitelist", async function () {
      const addresses = [signers.alice.address, signers.bob.address, signers.charlie.address];
      const encryptedInputs = [];

      for (const addr of addresses) {
        const encrypted = await fhevm.createEncryptedInput(veilWhitelistAddress, addr).encrypt();
        encryptedInputs.push(encrypted.handles[0]);
      }

      const attestation = await fhevm.getAttestation(veilWhitelistAddress);

      const tx = await veilWhitelist
        .connect(signers.deployer)
        .addWhitelist(campaignId, encryptedInputs, attestation);
      await tx.wait();

      const info = await veilWhitelist.getCampaignInfo(campaignId);
      expect(info.whitelistSize).to.equal(3n);
    });

    it("Should check access for whitelisted address", async function () {
      const encrypted = await fhevm
        .createEncryptedInput(veilWhitelistAddress, signers.alice.address)
        .encrypt();
      const attestation = await fhevm.getAttestation(veilWhitelistAddress);

      const result = await veilWhitelist
        .connect(signers.alice)
        .checkAccessAll(campaignId, encrypted.handles[0], attestation);

      const decrypted = await fhevm.userDecryptEbool(
        result.toString(),
        veilWhitelistAddress,
        signers.alice,
      );

      expect(decrypted).to.be.true;
    });

    it("Should return false for non-whitelisted address", async function () {
      const newSigner = (await ethers.getSigners())[4];
      const encrypted = await fhevm
        .createEncryptedInput(veilWhitelistAddress, newSigner.address)
        .encrypt();
      const attestation = await fhevm.getAttestation(veilWhitelistAddress);

      const result = await veilWhitelist
        .connect(newSigner)
        .checkAccessAll(campaignId, encrypted.handles[0], attestation);

      const decrypted = await fhevm.userDecryptEbool(
        result.toString(),
        veilWhitelistAddress,
        newSigner,
      );

      expect(decrypted).to.be.false;
    });

    it("Should remove whitelist entry", async function () {
      const sizeBefore = (await veilWhitelist.getCampaignInfo(campaignId)).whitelistSize;

      await veilWhitelist.connect(signers.deployer).removeWhitelistAt(campaignId, 0);

      const sizeAfter = (await veilWhitelist.getCampaignInfo(campaignId)).whitelistSize;
      expect(sizeAfter).to.equal(sizeBefore - 1n);
    });

    it("Should clear whitelist", async function () {
      await veilWhitelist.connect(signers.deployer).clearWhitelist(campaignId);

      const info = await veilWhitelist.getCampaignInfo(campaignId);
      expect(info.whitelistSize).to.equal(0n);
    });

    it("Should revert when adding empty batch", async function () {
      const attestation = await fhevm.getAttestation(veilWhitelistAddress);
      await expect(
        veilWhitelist.connect(signers.deployer).addWhitelist(campaignId, [], attestation),
      ).to.be.revertedWithCustomError(veilWhitelist, "EmptyBatch");
    });

    it("Should revert when checking access for non-existent campaign", async function () {
      const encrypted = await fhevm
        .createEncryptedInput(veilWhitelistAddress, signers.alice.address)
        .encrypt();
      const attestation = await fhevm.getAttestation(veilWhitelistAddress);

      await expect(
        veilWhitelist.connect(signers.alice).checkAccessAll(999, encrypted.handles[0], attestation),
      ).to.be.revertedWithCustomError(veilWhitelist, "CampaignNotFound");
    });
  });
});

