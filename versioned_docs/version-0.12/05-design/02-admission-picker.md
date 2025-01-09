# Admission Picker

## What is the admission picker?

The admission picker is used to determine whether the entry should be inserted
into the disk cache. It is a component of the hybrid cache.

You can use it when you create a hybrid cache. For example:

```rust
    let hybrid: HybridCache<u64, String> = HybridCacheBuilder::new()
        .memory(64 * 1024 * 1024)
        .storage(Engine::Large)
        .with_admission_picker(Arc::new(RateLimitPicker::new(100 * 1024 * 1024)))
        .build()
        .await?;
```

## Admission types

### RateLimitPicker
