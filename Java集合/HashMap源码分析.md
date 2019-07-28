---
title: HashMap源码分析
date: 2018-12-15
permalink: "20181215-HashMap"
---
<!-- more -->
## 1.前言
Java为数据结构中的映射定义了一个接口java.util.Map，此接口主要有四个常用的实现类，分别是HashMap、Hashtable、LinkedHashMap和TreeMap，类继承关系如下图所示：
![图不见了](/images/4.2/1.png)

下面针对各个实现类的特点做一些说明：

(1) **HashMap**：它根据键的hashCode值存储数据，大多数情况下可以直接定位到它的值，因而具有很快的访问速度，但遍历顺序却是不确定的。 HashMap最多只允许一条记录的键为null，允许多条记录的值为null。HashMap非线程安全，即任一时刻可以有多个线程同时写HashMap，可能会导致数据的不一致。如果需要满足线程安全，可以用 Collections的synchronizedMap方法使HashMap具有线程安全的能力，或者使用ConcurrentHashMap。

(2) **Hashtable**：Hashtable是遗留类，很多映射的常用功能与HashMap类似，不同的是它承自Dictionary类，并且是线程安全的，任一时间只有一个线程能写Hashtable，并发性不如ConcurrentHashMap，因为ConcurrentHashMap引入了分段锁。Hashtable不建议在新代码中使用，不需要线程安全的场合可以用HashMap替换，需要线程安全的场合可以用ConcurrentHashMap替换。

(3) **LinkedHashMap**：LinkedHashMap是HashMap的一个子类，保存了记录的插入顺序，在用Iterator遍历LinkedHashMap时，先得到的记录肯定是先插入的，也可以在构造时带参数，按照访问次序排序。

(4) **TreeMap**：TreeMap实现SortedMap接口，能够把它保存的记录根据键排序，默认是按键值的升序排序，也可以指定排序的比较器，当用Iterator遍历TreeMap时，得到的记录是排过序的。如果使用排序的映射，建议使用TreeMap。在使用TreeMap时，key必须实现Comparable接口或者在构造TreeMap传入自定义的Comparator，否则会在运行时抛出java.lang.ClassCastException类型的异常。

对于上述四种Map类型的类，要求映射中的key是不可变对象。不可变对象是该对象在创建后它的哈希值不会被改变。如果对象的哈希值发生变化，Map对象很可能就定位不到映射的位置了。而且一般是选择String、Integer这样wrapper类作为键，就是因为String是final，并且重写了equals()和hashCode()方法，满足了不可变性。

JDK1.8 之前 HashMap 由 数组+链表 组成的，数组是 HashMap 的主体，链表则是主要为了解决哈希冲突而存在的（“拉链法”解决冲突）.JDK1.8 以后在解决哈希冲突时有了较大的变化，当链表长度大于阈值（默认为 8）时，将链表转化为红黑树，以减少搜索时间。

## 2.源码分析
### 2.1 重要字段
```Java
initialCapacity    //HashMap初始容量
loadFactor         //负载因子
threshold          //当前 HashMap 所能容纳键值对数量的最大值,超过这个,则需扩容
size               //HashMap中实际存在的键值对数量,注意和table的长度length、容纳最大键值对数量threshold的区别
modCount           //用来记录HashMap内部结构发生变化的次数
```
相关代码如下：
```java
/**
    * The default initial capacity - MUST be a power of two.
    */
static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16


/**
    * The load factor used when none specified in constructor.
    */
static final float DEFAULT_LOAD_FACTOR = 0.75f;

/**
    * The number of key-value mappings contained in this map.
    */
transient int size;

/**
    * The number of times this HashMap has been structurally modified
    * Structural modifications are those that change the number of mappings in
    * the HashMap or otherwise modify its internal structure (e.g.,
    * rehash).  This field is used to make iterators on Collection-views of
    * the HashMap fail-fast.  (See ConcurrentModificationException).
    */
transient int modCount;

/**
    * The next size value at which to resize (capacity * load factor).
    *
    * @serial
    */
int threshold;

/**
    * The load factor for the hash table.
    *
    * @serial
    */
final float loadFactor;
```
默认情况下，HashMap 初始容量是16，负载因子为 0.75。这里并没有默认阈值，原因是阈值可由容量乘上负载因子计算而来，即<font color="red">threshold = capacity * loadFactor</font>。

然后我们看下HashMap的构造函数：
```Java
<!-- 构造方法1 -->
public HashMap() {
    this.loadFactor = DEFAULT_LOAD_FACTOR; // all other fields defaulted
}

<!-- 构造方法2 -->
public HashMap(int initialCapacity) {
    this(initialCapacity, DEFAULT_LOAD_FACTOR);
}

<!-- 构造方法3 -->
public HashMap(Map<? extends K, ? extends V> m) {
    this.loadFactor = DEFAULT_LOAD_FACTOR;
    putMapEntries(m, false);
}

<!-- 构造方法4 -->
public HashMap(int initialCapacity, float loadFactor) {
    if (initialCapacity < 0)
        throw new IllegalArgumentException("Illegal initial capacity: " +
                initialCapacity);
    if (initialCapacity > MAXIMUM_CAPACITY)
        initialCapacity = MAXIMUM_CAPACITY;
    if (loadFactor <= 0 || Float.isNaN(loadFactor))
        throw new IllegalArgumentException("Illegal load factor: " +
                loadFactor);
    this.loadFactor = loadFactor;
    this.threshold = tableSizeFor(initialCapacity);
}
```
可以看到前三个构造方法都将 DEFAULT_LOAD_FACTOR 传给了 loadFactor，除了第四个可以自定义 loadFactor，这里可以看到一个问题就是初始容量 initialCapacity 并没有再构造方法中用来初始 hashmap，只是作为一个形参传入到构造方法中，这里可以简单说明一下初始数据结构是从插入方法 putVal() 中调用 resize() 扩容方法时才开始的，这样可以节省一点空间，下面会具体说明扩容机制。
要说明的是构造方法4中的tableSizeFor()方法，它的作用是返回不小于输入参数的最小的2的整数次幂。
为什么是2的整数次幂？
- 取模运算 n%hash == (n-1) & hash 在n为2的整数次幂时成立，&运算可以提高性能。
- n为2的整数次幂时，经过(n-1) & hash运算后得到的桶数组坐标分布均匀，可以减少碰撞几率，提高效率。

### 2.2 确定哈希桶数组索引位置
不管增加、删除、查找键值对，定位到哈希桶数组的位置都是很关键的第一步。前面说过HashMap的数据结构是数组和链表的结合，HashMap通过 key 的 hashCode 经过扰动函数处理过后得到 hash 值，然后通过 (n - 1) & hash 判断当前元素存放的位置（这里的 n 指的是数组的长度）。如果当前位置存在元素的话，就判断该元素与要存入的元素的 hash 值以及 key 是否相同，如果相同的话，直接覆盖，不相同就通过拉链法解决冲突。
所谓扰动函数指的就是 HashMap 的 hash 方法。
```Java
<!-- JDK1.7的hash方法 -->
static int hash(int h) {
    // This function ensures that hashCodes that differ only by
    // constant multiples at each bit position have a bounded
    // number of collisions (approximately 8 at default load factor).

    h ^= (h >>> 20) ^ (h >>> 12);
    return h ^ (h >>> 7) ^ (h >>> 4);
}

<!-- JDK1.8的hash方法，比1.7版本要优化了一些，毕竟1.7的hash方法扰动了4次 -->
static final int hash(Object key) {
    int h;
    // key.hashCode()：返回散列值也就是hashcode
    // ^ ：按位异或
    // >>>:无符号右移，忽略符号位，空位都以0补齐
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    //h >>> 16 h右移16位是为了让h的高16位也参与到运算中
}
```
hash算法的本质就是三步: 取key的hashCode值、高位运算、取模运算。
### 2.3 查找
```Java
    public V get(Object key) {
        Node<K,V> e;
        return (e = getNode(hash(key), key)) == null ? null : e.value;
    }

    final Node<K,V> getNode(int hash, Object key) {
        Node<K,V>[] tab; Node<K,V> first, e; int n; K k;
        //定位键值所在桶位置
        if ((tab = table) != null && (n = tab.length) > 0 &&
                (first = tab[(n - 1) & hash]) != null) {
            //与桶位置所放的首节点进行比较
            if (first.hash == hash && // always check first node
                    ((k = first.key) == key || (key != null && key.equals(k))))
                return first;
            if ((e = first.next) != null) {
                //如果first时TreeNode类型，调用红黑树查找方法
                if (first instanceof TreeNode)
                    return ((TreeNode<K,V>)first).getTreeNode(hash, key);
                //循环遍历链表 比较节点的hash和key值是否相等
                do {
                    if (e.hash == hash &&
                            ((k = e.key) == key || (key != null && key.equals(k))))
                        return e;
                } while ((e = e.next) != null);
            }
        }
        return null;
    }
```
hashmap的查找方法并不复杂，结合注释很容易可以看懂。

### 2.4 插入
![图不见了](/images/4.2/2.png)

HashMap的put源码如下：
```Java
    public V put(K key, V value) {
        return putVal(hash(key), key, value, false, true);
    }

    final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
        //步骤1. 判断键值对数组table[i]是否为空或为null，否则执行resize()进行扩容
        if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;
        //步骤2. 根据键值key计算hash值得到插入的数组索引i，
        如果table[i]==null，直接新建节点添加，转向步骤6，如果table[i]不为空，转向步骤3
        if ((p = tab[i = (n - 1) & hash]) == null)
            tab[i] = newNode(hash, key, value, null);
        else {
            Node<K,V> e; K k;
            //步骤3. 判断table[i]的首个元素是否和key一样，如果相同直接覆盖value，否则转向步骤5
            if (p.hash == hash &&
                    ((k = p.key) == key || (key != null && key.equals(k))))
                e = p;
            //步骤4. 判断table[i]是否是红黑树，如果是红黑树，则直接在树中插入键值对，否则转向步骤5
            else if (p instanceof TreeNode)
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            //步骤5. 遍历链表
            else {
                for (int binCount = 0; ; ++binCount) {
                    if ((e = p.next) == null) {
                        p.next = newNode(hash, key, value, null);
                        //判断链表长度是否大于8 大于的话进行树化
                        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                            treeifyBin(tab, hash);
                        break;
                    }
                    // key已经存在直接覆盖value
                    if (e.hash == hash &&
                            ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    p = e;
                }
            }
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }
        ++modCount;
        //步骤6. 超过最大容量threshold 进行扩容
        if (++size > threshold)
            resize();
        afterNodeInsertion(evict);
        return null;
    }
```
### 2.5 扩容
扩容是一个特别耗性能的操作，所以当程序员在使用HashMap的时候，估算map的大小，初始化的时候给一个大致的数值，避免map进行频繁的扩容。
```Java
    final Node<K,V>[] resize() {
        Node<K,V>[] oldTab = table;
        int oldCap = (oldTab == null) ? 0 : oldTab.length;
        int oldThr = threshold;
        int newCap, newThr = 0;
        // table不为空 已经被初始化过了
        if (oldCap > 0) {
            // 容量大于最大容量时不再扩容
            if (oldCap >= MAXIMUM_CAPACITY) {
                threshold = Integer.MAX_VALUE;
                return oldTab;
            }
            // 新容量和阈值threshold都变为原来的两倍
            else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                    oldCap >= DEFAULT_INITIAL_CAPACITY)
                //【0】此处可能导致【3】处容量溢出归零
                newThr = oldThr << 1; // double threshold
        }
        else if (oldThr > 0) // initial capacity was placed in threshold
            //【1】初始化时 用threshold保存initialCapacity参数值，现在赋值给newCap
            newCap = oldThr;
        else {               // zero initial threshold signifies using defaults
            //【2】调用无参构造方法时 桶数组容量为默认容量，阈值threshold为默认容量与默认负载因子的乘积
            newCap = DEFAULT_INITIAL_CAPACITY;
            newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
        }
        // 【3】未计算newThr或者在【1】处溢出归零了
        if (newThr == 0) {
            float ft = (float)newCap * loadFactor;
            newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                    (int)ft : Integer.MAX_VALUE);
        }
        threshold = newThr;
        
        Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
        table = newTab;
        if (oldTab != null) {
            // 将旧的桶数组Node移到新的桶数组中
            for (int j = 0; j < oldCap; ++j) {
                Node<K,V> e;
                if ((e = oldTab[j]) != null) {
                    oldTab[j] = null;
                    if (e.next == null)
                        newTab[e.hash & (newCap - 1)] = e;
                    else if (e instanceof TreeNode)
                        ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                    else { // preserve order
                        Node<K,V> loHead = null, loTail = null;
                        Node<K,V> hiHead = null, hiTail = null;
                        Node<K,V> next;
                        // 遍历链表，并将链表节点按原顺序进行分组
                        do {
                            next = e.next;
                            //【4】还是原索引
                            if ((e.hash & oldCap) == 0) {
                                if (loTail == null)
                                    loHead = e;
                                else
                                    loTail.next = e;
                                loTail = e;
                            }
                            //原索引+oldCap
                            else {
                                if (hiTail == null)
                                    hiHead = e;
                                else
                                    hiTail.next = e;
                                hiTail = e;
                            }
                        } while ((e = next) != null);
                        // 原索引放到新桶里
                        if (loTail != null) {
                            loTail.next = null;
                            newTab[j] = loHead;
                        }
                        // 原索引+oldCap放到新桶里
                        if (hiTail != null) {
                            hiTail.next = null;
                            newTab[j + oldCap] = hiHead;
                        }
                    }
                }
            }
        }
        return newTab;
    }
```
说明一下【1】、【2】、【4】三处：
【1】：调用 HashMap(int) 和 HashMap(int, float) 构造方法时会产生这种情况，此种情况下 newCap = oldThr，等价于newCap = oldThr = tableSizeFor(initialCapcity)，这也就将初始化时传入的形参initialCapacity最终赋值给了newCap，newThr在【3】处算出。
【2】：调用 HashMap() 构造方法会产生这种情况。
【4】：首先要知道扩容之后通过 (n - 1) & hash 计算桶位置时，原先相同桶数组中的一条链上的元素可能会被放到新桶数组的其他位置上，(e.hash & oldCap) == 0 此处就是判断链上元素是否还是原桶索引位置，看下图说明：
![图不见了](/images/4.2/3.png)

## 最后
删除、树化、链化源码有待后续整理，HashMap的源码细节之处很多很多，这里只是根据个人所理解的粗略写了一点，感兴趣可以深入研究研究。