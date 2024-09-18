# Setup Hybrid Cache

This article will guide you through the process of setting up a hybrid cache.

Setting up a hybrid is a little bit complex than setting up an in-memory cache, but not much.

Let get through it!

## 1. Add foyer as a dependency

Add this line to the `[dependencies]` section of your project's `Cargo.toml`.

```toml
foyer = "0.11"
```

If you are using a nightly version of the rust toolchain, the `nightly` feature is needed.

```toml
foyer = { version = "0.11", features = ["nightly"] }
```

## 2. Build a `HybridCache`

### 2.1 Build with a builder

`HybridCache`[^hybrid-cache] can be built via `HybridCacheBuilder`[^hybrid-cache-builder].

```rust
let mut builder = HybridCacheBuilder::new();
```

Building `HybridCache` requires a two-phase build. The first step is building the in-memory cache via `memory()`[^memory], and the second step is to build the disk cache via `storage()`[^storage].

Before building the in-memory cache and the disk cache, you can configure some basic arguments of the hybrid cache. Such setting the name and the tracing config.

```rust
let mut builder = HybridCacheBuilder::new().with_name("foyer");
```

For more details, please refer to the API document.[^hybrid-cache-builder].

:::tip dynamic tail-based tracing config

The tracing config is used for configure the dynamic tail-based tracing. It can also be modified later. To learn more, see [Tutorial - Setup Monitor System](/docs/tutorial/monitor).

:::

### 2.2 Build in-memory cache

Setting up the in-memory cache is the same with using `CacheBuilder`[^cache-builder] to setup `Cache`.[^cache] The only differences you don't to create a new `CacheBuilder`, just call `memory()` with the capacity on `HybridCacheBuilder`.

```rust
let mut builder = HybridCacheBuilder::new().memory(1024);
```

The default configuration count the usage by entry count. If you needs to change it or change other configurations, please refer to [Tutorial - Setup In-memory Cache - 2. Build a `Cache`](/docs/tutorial/in-memory-cache#2-build-a-cache).

### 2.3 Build disk cache

#### 2.3.1 Run on in-memory cache compatible mode

After setting up the in-memory cache, you can call `storage()` to move on to setup the disk cache.

```rust
let mut builder = HybridCacheBuilder::new().memory(1024).storage();
```

By default, the hybrid cache will **NOT** include a disk cache unless you specify a device. The hybrid cache will run on a in-memory cache compatible mode with the default configuration. All lookups to the disk will return a miss. It is useful if you want to support both in-memory cache or the hybrid cache based on your project's configuration or for debugging.

:::tip 

RisingWave[^risingwave] supports caching the LSM-tree meta and blocks in both hybrid cache mode and in-memory cache mode by whether specifying the device. To learn how RisingWave uses ***foyer***, see [Case Study - RisingWave](/docs/case-study/risingwave).

:::

#### 2.3.2 Run on hybrid cache mode with a device

To specify a device for the hybrid cache, just call `with_device_config()`[^with-device-config] and provide the device config.

Currently, the storage of the hybrid cache supports 2 kinds of devices:

1. `DirectFsDevice`[^direct-fs-device]: Setup within a directory of a file system with direct I/O[^direct-io] files. 
2. `DirectFileDevice`[^direct-file-device]: Setup with a raw block device (block file) or a direct I/O[^direct-io] file in a file system. 

Determine which kind of device to use depends on your needs. If you want to utilize the spare space of an existing file system, `DirectFsDevice` is all you need. If you want to overcome the overhead of the file system, use `DirectFileDevice` on a raw block device. And **NEVER** use a `DirectFileDevice` within a file system. The `inode` latch will make the overhead of the file system layer worse.

:::tip

For more details about the overhead of the file system layer, see [Topic - Overhead of the File System Layer](/docs/topic/overhead-of-the-file-system-layer)

:::

Let's take `DirectFsDevice` as an example:

```rust
let hybrid: HybridCache<u64, String> = HybridCacheBuilder::new()
    .with_name("foyer")
    .memory(1024)
    .storage()
    .with_device_config(DirectFsDeviceOptionsBuilder::new("/data/foyer").build())
    .build()
    .await
    .unwrap();
```

This example uses directory `/data/foyer` to store disk cache data using a device options builder. With the default configuration, ***foyer*** will take 80% of the current free space as the disk cache capacity. You can also specify the disk cache capacity and per file size with the builder.

For more details, please refer to the API document.[^direct-fs-device-options-builder] [^direct-file-device-options-builder]

#### 2.3.3 Restrict the throughput

The bandwidth of the disk is much lower than the bandwidth of the memory. To avoid excessive use of the disk bandwidth, it is **HIGHLY RECOMMENDED** to setup the admission picker with a rate limiter.

```rust
let hybrid: HybridCache<u64, String> = HybridCacheBuilder::new()
    .with_name("foyer")
    .memory(1024)
    .storage()
    .with_device_config(DirectFsDeviceOptionsBuilder::new("/data/foyer").build())
    .with_admission_picker(Arc::new(RateLimitPicker::new(100 * 1024 * 1024)))
    .build()
    .await
    .unwrap();
```

You can also customize the admission picker with your own admission policy. For more details, please refer to the API document.[^admission-picker]

:::tip admission picker

Admission means allowing an entry to be inserted into the disk cache. And a admission picker can be used to customize the admission policy.

For more details, please refer to [Design - Architecture](/docs/design/architecture).

:::

#### 2.3.4 Achieve better performance

The hybrid cache builder also provides a lot of detailed arguments for tuning.

For example:

- `with_indexer_shards()` can be used for mitigating hot shards of the indexer.
- `with_flushers()`, `with_reclaimers()` and `with_recover_concurrency()` can be used to tune the concurrency of the inner components.
- `with_runtime_config()` can be used to enable the dedicated runtime or further runtime splitting.

Tuning the optimized parameters requires an understanding of ***foyer*** interior design and benchmarking with the real workload. For more details, please refer to [Design - Architecture](/docs/design/architecture).

## 3. `HybridCache` Usage

***TBC ... ...***

[^hybrid-cache]: https://docs.rs/foyer/latest/foyer/struct.HybridCache.html

[^hybrid-cache-builder]: https://docs.rs/foyer/latest/foyer/struct.HybridCacheBuilder.html

[^memory]: https://docs.rs/foyer/latest/foyer/struct.HybridCacheBuilder.html#method.memory

[^storage]: https://docs.rs/foyer/latest/foyer/struct.HybridCacheBuilderPhaseMemory.html#method.storage

[^cache-builder]: https://docs.rs/foyer/latest/foyer/struct.CacheBuilder.html

[^cache]: https://docs.rs/foyer/latest/foyer/enum.Cache.html

[^risingwave]: https://github.com/risingwavelabs/risingwave

[^with-device-config]: https://docs.rs/foyer/latest/foyer/struct.HybridCacheBuilderPhaseStorage.html#method.with_device_config

[^direct-fs-device]: https://docs.rs/foyer/latest/foyer/struct.DirectFsDevice.html

[^direct-file-device]: https://docs.rs/foyer/latest/foyer/struct.DirectFileDevice.html

[^direct-io]: https://linux.die.net/HOWTO/SCSI-Generic-HOWTO/dio.html

[^direct-fs-device-options-builder]: https://docs.rs/foyer/latest/foyer/struct.DirectFsDeviceOptionsBuilder.html

[^direct-file-device-options-builder]: https://docs.rs/foyer/latest/foyer/struct.DirectFileDeviceOptionsBuilder.html

[^admission-picker]: https://docs.rs/foyer/latest/foyer/trait.AdmissionPicker.html
