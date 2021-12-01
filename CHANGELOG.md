<<<<<<< HEAD
## [1.23.6](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.23.5...v1.23.6) (2021-10-29)


### Bug Fixes

* **nft-collection:** change response of my collections to return collections of owned nfts ([b1ac1ae](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/b1ac1aef704a5a682c5f7d759487dfe3dbf1a747))

## [1.23.5](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.23.4...v1.23.5) (2021-10-26)


### Bug Fixes

* process nfts from moralis logs ([#127](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/127)) ([664a51e](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/664a51ee3d304a4115081ac0ed7e21ae34aebd35))

=======
>>>>>>> 3125d056220e72cefdd2f0d8d51319f8b4d68b62
## [1.23.4](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.23.3...v1.23.4) (2021-10-26)


### Bug Fixes

* don't update db if Moralis request fails ([#123](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/123)) ([d293bb3](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/d293bb3b128a9a02e946145fc81506e07cd30c72))

## [1.23.3](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.23.2...v1.23.3) (2021-10-21)


### Bug Fixes

* bring environment variables up-to-date ([553d306](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/553d306c50ce15d4cd6df02ab47d21d8a09cc7c8))

## [1.23.2](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.23.1...v1.23.2) (2021-10-18)


### Bug Fixes

* **reward-tier-nft:** add db migration ([0eaaa43](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/0eaaa4307d61a22720b29f7253828d7805db1803))

## [1.23.1](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.23.0...v1.23.1) (2021-10-18)


### Bug Fixes

* **reward-tier-nft-entity:** allow slot field to be null ([a51ef27](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/a51ef27162b560de65970c801c854d9b09867366))

# [1.23.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.22.5...v1.23.0) (2021-10-18)


### Bug Fixes

* **active-auction:** we need current auction according to desgin ([fa0caa7](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/fa0caa77af9b196e84aed24d283355eb6ecd3b6d))
* **deploy-auction:** add temporary endpoint for populating deployed auction info ([21e5def](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/21e5defb5da97fecee9779e932375384a457525e))
* **nft-availability:** add slot, tokenId to response ([be2ed88](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/be2ed882e666ef5199063598be9a8b134da643cd))
* **nft-availability:** make response smaller and return tokenId and rewardTierId ([2ca6b87](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/2ca6b87bdb84c784e4b9862dc66a5b119c296615))
* **nft-availablity:** add nft id to response ([91b50d5](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/91b50d51e2eec7c36fab9a84535ac3b2b08f336b))
* **save-reward-tier:** reward tiers params accept nftIds[] ([8ec353e](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/8ec353e42c407b9fe61848c33992ceb0d77d5ac3))
* **update-reward-tiers:** handle create,delete,change cases ([ee163ae](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/ee163aee337930cbfcb2ac41c11cf2f8417eb580))
* wrong mapping search ([3bcd7a0](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/3bcd7a0ff6e84188a5fa5bb38da7e98ec4bb7257))


### Features

* **finalize-auction:** add deposit and withdraw nfts temp endpoints ([df66bbd](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/df66bbd3e79370ba57870bbc04bbd862582d679b))

## [1.22.5](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.22.4...v1.22.5) (2021-10-15)


### Bug Fixes

* optimise cron calls ([#93](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/93)) ([3b4fdef](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/3b4fdef6b69edbb2822e26b06fadac0ebaa12565))

## [1.22.4](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.22.3...v1.22.4) (2021-10-15)


### Bug Fixes

* **collection-page:** Small fixes + added search by name ([6da1f2a](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/6da1f2afd9a2f05db311f95b3cd540ef4bdbeacc))

## [1.22.3](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.22.2...v1.22.3) (2021-10-13)


### Bug Fixes

* process scraper events only for existing MintingNFTs ([f2e318a](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/f2e318af2dbd610c9da24583830c37524daf5f55))

## [1.22.2](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.22.1...v1.22.2) (2021-10-11)


### Performance Improvements

* keep track of the number of minting NFTs ([#71](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/71)) ([5c4b347](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/5c4b347c2da9eb167e1cad5ab27c07d4e15f4352))

## [1.22.1](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.22.0...v1.22.1) (2021-10-07)


### Bug Fixes

* **nft-page-tokenids:** wrong query ([4b49bef](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/4b49bef36bc99c7f97682ce519ce8d996a01c27e))

# [1.22.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.21.5...v1.22.0) (2021-10-06)


### Features

* store file on Arweave ([#68](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/68)) ([bbcb2f7](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/bbcb2f708be125e0f4ec773e43b0f003c807db8a))

## [1.21.5](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.21.4...v1.21.5) (2021-10-04)


### Bug Fixes

* **nft page:** fix nft creator query ([3a682ff](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/3a682ffad7ca83fa14914a16c3c6700959c2c2f7))

## [1.21.4](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.21.3...v1.21.4) (2021-10-03)


### Bug Fixes

* move tables to separate db schema ([#58](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/58)) ([8efc324](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/8efc324ef15bdf42228515ac5dee2afe2cf9ba93))

## [1.21.3](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.21.2...v1.21.3) (2021-10-03)


### Bug Fixes

* handle collection without creator error ([cc5f812](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/cc5f812d5eea07f6c6894dcb103df454cb1a35e8))

## [1.21.2](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.21.1...v1.21.2) (2021-09-30)


### Bug Fixes

* don't execute DELETE query when not needed ([#55](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/55)) ([905d3d7](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/905d3d7ac91eddbaed56f27985a478273b9e47d3))

## [1.21.1](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.21.0...v1.21.1) (2021-09-30)


### Bug Fixes

* separate endpoint to get pending NFTs ([#54](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/54)) ([78a302d](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/78a302da0828c3c643e5dabdf2b15ff45796f681))

# [1.21.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.20.0...v1.21.0) (2021-09-30)


### Features

* add endpoint for pending collections ([#53](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/53)) ([42d7781](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/42d7781dfa4cb16c857cf9f1a2b99b8efa98ee17))

# [1.20.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.19.0...v1.20.0) (2021-09-29)


### Features

* add creator address to NFTs ([#52](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/52)) ([8e2b85e](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/8e2b85eb6c51ec162fc7e729e77c085388f4bfdf))

# [1.19.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.18.0...v1.19.0) (2021-09-28)


### Features

* separate Saved NFTs from Minting NFTs ([#49](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/49)) ([aa754a7](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/aa754a7bae71abbf4a376c3270938e9dc7c96cb9))

# [1.18.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.17.2...v1.18.0) (2021-09-28)


### Features

* add single nft enpoint ([#47](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/47)) ([ab4f607](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/ab4f607b742c88de9e3728f44914c80007a2a90e))

## [1.17.2](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.17.1...v1.17.2) (2021-09-27)


### Bug Fixes

* check existing profile page url ([#50](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/50)) ([02e0f6e](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/02e0f6e698838ae1d476ff16ea5663ad78e27539))

## [1.17.1](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.17.0...v1.17.1) (2021-09-24)


### Bug Fixes

* save profile info checks for duplicate user page url ([#48](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/48)) ([b43c95c](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/b43c95c2a4af7e94ea4f2c89165c5df2cf88d479))

# [1.17.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.16.1...v1.17.0) (2021-09-22)


### Features

* make collection and user endpoint public ([0e4fb27](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/0e4fb2721409dfd1e870773b561bc9288048d821))

## [1.16.1](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.16.0...v1.16.1) (2021-09-21)


### Bug Fixes

* modify NFT attributes to match updated OpenSea standard ([dbe6301](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/dbe630134a4bacc5d735f78fefbc0ce5f93638a7))

# [1.16.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.15.1...v1.16.0) (2021-09-20)


### Features

* add endpoint for getting my nfts with availability information ([#40](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/40)) ([95804d1](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/95804d1b2293e26d8bfc5fbdb9d88da9c74148dd))

## [1.15.1](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.15.0...v1.15.1) (2021-09-19)


### Bug Fixes

* handle editions minted in different blocks ([#43](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/43)) ([0cf059e](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/0cf059e9c75636516d1cc7bb9ee5e4a91b4ec630))

# [1.15.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.14.4...v1.15.0) (2021-09-19)


### Features

* add ability to cancel future auction ([#33](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/33)) ([42404a7](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/42404a7e29f61e9a911cae602bc658fa414b9aba))

## [1.14.4](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.14.3...v1.14.4) (2021-09-17)


### Bug Fixes

* get Collection which doesn't have NFTs ([0e4a943](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/0e4a9432ac4879817d5de301b32589487cba7fbd))

## [1.14.3](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.14.2...v1.14.3) (2021-09-17)


### Bug Fixes

* prevent creating collections without tx hash ([f32f041](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/f32f041828ae227b65c047c698e11d11da1d75b3))

## [1.14.2](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.14.1...v1.14.2) (2021-09-16)


### Bug Fixes

* add missing collection attribute to My NFTs response ([2c76694](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/2c766942ebc9180a54cb5d36f7e6dad207214b10))

## [1.14.1](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.14.0...v1.14.1) (2021-09-16)


### Bug Fixes

* get my future auctions returns all auctions ([#38](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/38)) ([1b4645f](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/1b4645f7c725d1fd801792daf2b06b255f641270))

# [1.14.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.13.3...v1.14.0) (2021-09-16)


### Features

* add change reward tier image endpoint and service ([#36](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/36)) ([83adf5b](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/83adf5bb44d2871398ba56671f9e635e1e0d0127))

## [1.13.3](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.13.2...v1.13.3) (2021-09-16)


### Bug Fixes

* change attribute name for token id ([#37](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/37)) ([a76c033](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/a76c0336f9a3fde85f85b89783e9fb42323d2cce))

## [1.13.2](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.13.1...v1.13.2) (2021-09-16)


### Bug Fixes

* group NFTs by edition for My Collection response ([#35](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/35)) ([37286af](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/37286af5f8291408fb7d52a3b35dc63960848d07))

## [1.13.1](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.13.0...v1.13.1) (2021-09-13)


### Bug Fixes

* edit color and description of reward tier ([#32](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/32)) ([f68d179](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/f68d17905ccd9e8de69f61d22d00427eec5c05c0))

# [1.13.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.12.0...v1.13.0) (2021-09-06)


### Features

* edit collection's off-chain attributes ([#31](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/31)) ([0cf8f11](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/0cf8f11bd9d87f18fa67f14f6fc087e52f560f94))

# [1.12.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.11.0...v1.12.0) (2021-09-06)


### Features

* add endpoint to get my collection based on id ([e1d4739](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/e1d4739da23746f024bcc43295f3e71ad9fe9246))

# [1.11.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.10.1...v1.11.0) (2021-09-03)


### Features

* add endpoint for public Auction Page ([#30](https://github.com/UniverseXYZ/UniverseApp-Backend/issues/30)) ([74c4a8c](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/74c4a8c07c8e533d289c7f6e6651a2ecfa63a6fb))

## [1.10.1](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.10.0...v1.10.1) (2021-09-02)


### Bug Fixes

* fetch reward tiers by correct id ([b4353e7](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/b4353e7658c565520930603820d72822c3f8abd6))

# [1.10.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.9.1...v1.10.0) (2021-08-05)


### Features

* add endpoints for active and past auctions ([9599c5d](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/9599c5d0544257d810a426e6f156a3c4e14b157a))

## [1.9.1](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.9.0...v1.9.1) (2021-08-04)


### Bug Fixes

* add royalties and traits to My NFTs response ([9cccea1](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/9cccea1caf711fceaf061794b3ddc070fcc94ede))

# [1.9.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.8.6...v1.9.0) (2021-07-30)


### Features

* add ability to edit reward tier ([af1dd97](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/af1dd97e504ed336d7061a75cb0837fe204506d9))

## [1.8.6](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.8.5...v1.8.6) (2021-07-30)


### Bug Fixes

* fix scraper ([2ee246c](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/2ee246cd17df7e69420e8a55e7c20b833a84ce39))

## [1.8.5](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.8.4...v1.8.5) (2021-07-30)


### Bug Fixes

* handle NFTs minted in the same transaction ([11d3e46](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/11d3e464a4127c11c2f4880c938aad89222b73b1))

## [1.8.4](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.8.3...v1.8.4) (2021-07-29)


### Bug Fixes

* improve cron error handling ([c32d554](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/c32d55480debb6a2e54b2b2c5e62c53c8a764ef9))

## [1.8.3](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.8.2...v1.8.3) (2021-07-29)


### Bug Fixes

* pass the user address to get collections ([7c04c67](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/7c04c676d84d5f86658a69a690c9eeeca876ad35))

## [1.8.2](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.8.1...v1.8.2) (2021-07-29)


### Bug Fixes

* fix my collections endpoint ([fefc5b0](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/fefc5b0bcd7d5a911edf561eca74368e131bfc89))

## [1.8.1](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.8.0...v1.8.1) (2021-07-29)


### Bug Fixes

* lower case user addresses ([5f9f90c](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/5f9f90cb07455e388cd4d22f385e7cf42fd9cf30))

# [1.8.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.7.0...v1.8.0) (2021-07-28)


### Features

* add royalty split to NFTs ([00b441c](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/00b441c07b29fc1b4edcb1fc103bf85295c78409))

# [1.7.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.6.0...v1.7.0) (2021-07-28)


### Features

* add royalty split to saved nfts ([8a80c7f](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/8a80c7f28b27846ffebb746fcd715957460283cf))

# [1.6.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.5.0...v1.6.0) (2021-07-21)


### Features

* create & edit auction endpoints ([fb52eb9](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/fb52eb978f22984e91e78b55c6827dfbc7ec23e9))

# [1.5.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.4.0...v1.5.0) (2021-07-16)


### Features

* delete Saved NFTs ([250e500](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/250e500c922c72faf2e6c3ba95fed6d20d8dc182))

# [1.4.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.3.0...v1.4.0) (2021-07-08)


### Features

* add collection to saved nfts ([6d302cb](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/6d302cb163cbd22f2709cbef8ec71a2e4d0fce61))

# [1.3.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.2.0...v1.3.0) (2021-06-30)


### Features

* add minted nfts events ([5287982](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/52879828fd50c961f5f8a77fb958ac4a8829aec6))

# [1.2.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.1.1...v1.2.0) (2021-06-28)


### Features

* generate token uri for unsaved nft ([29bcf40](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/29bcf40c2c7f6b00406a85633d4be05bce3236b2))

## [1.1.1](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.1.0...v1.1.1) (2021-06-23)


### Bug Fixes

* user profile image url ([cc27fd7](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/cc27fd709e92ad2f73de79609d3199e0f049c2fb))

# [1.1.0](https://github.com/UniverseXYZ/UniverseApp-Backend/compare/v1.0.0...v1.1.0) (2021-06-16)


### Features

* add PATCH saved NFT ([cc93ea2](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/cc93ea253594ec4fa2cf73e1dca83f3dfc0d05a4))

# 1.0.0 (2021-06-15)


### Bug Fixes

* improve validation errors ([8d4ce5d](https://github.com/UniverseXYZ/UniverseApp-Backend/commit/8d4ce5dcd096615501a964206f3612089c290e25))
