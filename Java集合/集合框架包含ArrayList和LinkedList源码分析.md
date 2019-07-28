---
title: 集合框架包含ArrayList和LinkedList源码分析
date: "2018-10-01"
permalink: "20181001-集合框架"
---
<!-- more -->
## 1.集合框架
Java中集合是用来存储对象的工具类容器，它实现了常用的数据结构，提供了一系列公开的方法用于增加、删除、修改、查找和遍历数据，降低了日常开发成本。集合的种类非常多，如下图所示，集合主要分为两类：第一类是按照单个元素存储的Collection，在继承树的Set和List都实现了Collection接口；第二类是按照Key-Value存储的Map。以上两类集合体系，无论数据存取还是遍历，都存在非常大的差异。
![图不见了](/images/4.3/1.png)
**Collection**
1. List
- Arraylist：数组（查询快,增删慢 线程不安全,效率高 ）
- Vector：数组（查询快,增删慢 线程安全,效率低 ）
- LinkedList：链表（查询慢,增删快 线程不安全,效率高 ）

2. Set
- HashSet（无序，唯一）:哈希表或者叫散列集(hash table)
- LinkedHashSet：链表和哈希表组成 。 由链表保证元素的排序 ， 由哈希表证元素的唯一性
- TreeSet（有序，唯一）：红黑树(自平衡的排序二叉树。)

**Map**
- HashMap：基于哈希表的Map接口实现（哈希表对键进行散列，Map结构即映射表存放键值对）
- LinkedHashMap:HashMap 的基础上加上了链表数据结构
- HashTable:哈希表
- TreeMap:红黑树（自平衡的排序二叉树）

## 2.源码分析
首先拿两个List的类学习一下：ArrayList和LinkedList，主要了解二者数据结构以及什么情况下选择哪种集合类。
### 2.1 ArrayList
ArrayList 是一种变长的集合类，基于定长数组实现。ArrayList 允许空值和重复元素，当往 ArrayList 中添加的元素数量大于其底层数组容量时，其会通过扩容机制重新生成一个更大的数组。另外，由于 ArrayList 底层基于数组实现，所以其可以保证在 O(1) 复杂度下完成随机查找操作。其他方面，ArrayList 是非线程安全类，并发环境下，多个线程同时操作 ArrayList，会引发不可预知的错误。
#### 2.1.1 构造方法
```Java
    private static final int DEFAULT_CAPACITY = 10;

    private static final Object[] EMPTY_ELEMENTDATA = {};

    private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

    transient Object[] elementData; 

    private int size;

    // 构造方法1
    public ArrayList(int initialCapacity) {
        if (initialCapacity > 0) {
            this.elementData = new Object[initialCapacity];
        } else if (initialCapacity == 0) {
            this.elementData = EMPTY_ELEMENTDATA;
        } else {
            throw new IllegalArgumentException("Illegal Capacity: "+
                                               initialCapacity);
        }
    }

    // 构造方法2
    public ArrayList() {
        this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
    }

    // 构造方法3
    public ArrayList(Collection<? extends E> c) {
        elementData = c.toArray();
        if ((size = elementData.length) != 0) {
            if (elementData.getClass() != Object[].class)
                elementData = Arrays.copyOf(elementData, size, Object[].class);
        } else {
            this.elementData = EMPTY_ELEMENTDATA;
        }
    }
```
构造方法1是传入初始容量值，构造方法2是无参的，构造方法3是传入一个集合。一般情况下，我们用无参的构造方法即可。倘若在可知道将会向 ArrayList 插入多少元素的情况下，应该使用有参构造方法。按需分配，避免浪费。
#### 2.1.2 插入
```Java
    /**
     * This helper method split out from add(E) to keep method
     * bytecode size under 35 (the -XX:MaxInlineSize default value),
     * which helps when add(E) is called in a C1-compiled loop.
     */
    private void add(E e, Object[] elementData, int s) {
        if (s == elementData.length)
            elementData = grow();
        elementData[s] = e;
        size = s + 1;
    }

    public boolean add(E e) {
        modCount++;
        add(e, elementData, size);
        return true;
    }

    public void add(int index, E element) {
        // 检测index是否合理
        rangeCheckForAdd(index);
        modCount++;
        final int s;
        Object[] elementData;
        if ((s = size) == (elementData = this.elementData).length)
            // 当元素的size等于数组长度时，进行扩容
            elementData = grow();
        // 将index及其之后的元素向后移一位
        System.arraycopy(elementData, index,
                         elementData, index + 1,
                         s - index);
        // 插入新元素
        elementData[index] = element;
        size = s + 1;
    }
```
插入方法有3种，add(E e, Object[] elementData, int s)方法是从add(E e)中分离出来的，算是一个优化吧(至于为啥保持方法字节码大小低于35，Google了一下也没找到。。。)，第1和第2算是一个方法吧，都是在数组尾部插入，时间复杂度为O(1)，第3种是在指定索引处插入，需要先将指定索引以及其后面的元素都向后移一位，然后将新元素插入，时间复杂度就变成了O(N)。
需要注意的是第3种add方法中的 grow() 方法，这就涉及到ArrayList中比较核心的扩容机制了，看下源码流程：
```Java
    private Object[] grow() {
        return grow(size + 1);
    }

    private Object[] grow(int minCapacity) {
        return elementData = Arrays.copyOf(elementData,
                                           newCapacity(minCapacity));
    }

    private int newCapacity(int minCapacity) {
        int oldCapacity = elementData.length;
        // newCapacity = (1 + 0.5) * oldCapacity 扩容之后是之前的1.5倍
        int newCapacity = oldCapacity + (oldCapacity >> 1);
        if (newCapacity - minCapacity <= 0) {
            if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA)
                return Math.max(DEFAULT_CAPACITY, minCapacity);
            if (minCapacity < 0)
                throw new OutOfMemoryError();
            return minCapacity;
        }
        return (newCapacity - MAX_ARRAY_SIZE <= 0)
            ? newCapacity
            : hugeCapacity(minCapacity);
    }

    private static int hugeCapacity(int minCapacity) {
        if (minCapacity < 0) // overflow
            throw new OutOfMemoryError();
        return (minCapacity > MAX_ARRAY_SIZE)
            ? Integer.MAX_VALUE
            : MAX_ARRAY_SIZE;
    }
```
主要就是容量变成原来的1.5倍，其它地方都是边界检查，数组越界会报 OutOfMemoryError 异常。
#### 2.1.3 删除
```Java
    // 删除指定位置的元素
    public E remove(int index) {
        Objects.checkIndex(index, size);
        final Object[] es = elementData;

        @SuppressWarnings("unchecked") 
        E oldValue = (E) es[index];
        fastRemove(es, index);

        return oldValue;
    }

    // 删除指定元素
    public boolean remove(Object o) {
        final Object[] es = elementData;
        final int size = this.size;
        int i = 0;
        found: {
            if (o == null) {
                for (; i < size; i++)
                    if (es[i] == null)
                        break found;
            } else {
                for (; i < size; i++)
                    if (o.equals(es[i]))
                        break found;
            }
            return false;
        }
        fastRemove(es, i);
        return true;
    }

    // 快速删除，不做边界检查也不返回元素值
    private void fastRemove(Object[] es, int i) {
        modCount++;
        final int newSize;
        if ((newSize = size - 1) > i)
            System.arraycopy(es, i + 1, es, i, newSize - i);
        es[size = newSize] = null;
    }
```
删除逻辑也不复杂，第2个方法要比第1个方法多了查找元素位置的操作，在 fastRemove 方法中将 index + 1 及之后的元素向前移动一位，然后将最后一个元素置null，size 减 1。
#### 2.1.4 遍历
下面是我们用到的三种遍历方式：
```Java
    ArrayList<String> list = new ArrayList<String>();
    // list.add()添加元素
    // 1.普通for循环遍历
    for(int i = 0; i < list.size(); i++){}

    // 2.增强for循环遍历，语法糖
    for(String s : list){}

    // 3.迭代器，增强for循环也是转换成迭代器
    Iterator iterator = list.iterator();
    while(iterator.hasNext()){
        String s = iterator.next();
    }
```
看下 iterator() 的实现:
```Java
    public Iterator<E> iterator() {
        return new Itr();
    }

    /**
     * An optimized version of AbstractList.Itr
     */
    private class Itr implements Iterator<E> {
        int cursor;       // index of next element to return
        int lastRet = -1; // index of last element returned; -1 if no such
        int expectedModCount = modCount;

        // prevent creating a synthetic constructor
        Itr() {}

        public boolean hasNext() {
            return cursor != size;
        }

        @SuppressWarnings("unchecked")
        public E next() {
            checkForComodification();
            int i = cursor;
            if (i >= size)
                throw new NoSuchElementException();
            Object[] elementData = ArrayList.this.elementData;
            if (i >= elementData.length)
                throw new ConcurrentModificationException();
            cursor = i + 1;
            return (E) elementData[lastRet = i];
        }

        public void remove() {
            if (lastRet < 0)
                throw new IllegalStateException();
            checkForComodification();

            try {
                ArrayList.this.remove(lastRet);
                cursor = lastRet;
                lastRet = -1;
                expectedModCount = modCount;
            } catch (IndexOutOfBoundsException ex) {
                throw new ConcurrentModificationException();
            }
        }

        // 省略部分源码
    }
```
list.iterator() 方法返回 Iterator 的子类 Itr ，Itr也是一个私有的内部类，主要用到就是 hasNext() 判断 list 中 cursor 处是否存在元素，还有 next() 方法返回 cursor 处的元素。
至于 Itr 中 remove() 方法，引用阿里巴巴开发手册中的话：
> 【强制】不要在 foreach 循环里进行元素的 remove/add 操作。remove 元素请使用 Iterator 方式，如果并发操作，需要对 Iterator 对象加锁。

### 2.2 LinkedList
#### 2.2.1 构造方法
```Java
    transient int size = 0;

    transient Node<E> first;

    transient Node<E> last;

    private static class Node<E> {
        E item;
        Node<E> next;
        Node<E> prev;

        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
    }

    public LinkedList() {
    }

    public LinkedList(Collection<? extends E> c) {
        this();
        addAll(c);
    }

    public boolean addAll(Collection<? extends E> c) {
        return addAll(size, c);
    }

    public boolean addAll(int index, Collection<? extends E> c) {
        checkPositionIndex(index);

        Object[] a = c.toArray();
        int numNew = a.length;
        if (numNew == 0)
            return false;

        Node<E> pred, succ;
        if (index == size) {
            succ = null;
            pred = last;
        } else {
            succ = node(index);
            pred = succ.prev;
        }

        for (Object o : a) {
            @SuppressWarnings("unchecked") E e = (E) o;
            Node<E> newNode = new Node<>(pred, e, null);
            if (pred == null)
                first = newNode;
            else
                pred.next = newNode;
            pred = newNode;
        }

        if (succ == null) {
            last = pred;
        } else {
            pred.next = succ;
            succ.prev = pred;
        }

        size += numNew;
        modCount++;
        return true;
    }
```
LinkedList 数据结构为链表，节点 Node 包含了前驱节点、后继节点和自身数据 element，构造方法有无参和传入集合两种，传入集合调用了 addAll() 方法将传入的集合元素顺序遍历添加到链表的尾部。
#### 2.2.2 查询
```Java
    public E get(int index) {
        checkElementIndex(index);
        return node(index).item;
    }

    private void checkElementIndex(int index) {
        if (!isElementIndex(index))
            throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
    }

    private boolean isElementIndex(int index) {
        return index >= 0 && index < size;
    }

    Node<E> node(int index) {
        if (index < (size >> 1)) {
            Node<E> x = first;
            for (int i = 0; i < index; i++)
                x = x.next;
            return x;
        } else {
            Node<E> x = last;
            for (int i = size - 1; i > index; i--)
                x = x.prev;
            return x;
        }
    }
```
查询中 checkElementIndex() 方法判断入参是否是现有元素的索引，node() 方法利用了二分查找(简化版的，通过比较 index 与 size/2 的大小决定从头节点还是为节点进行查找)，获取入参索引所在的元素。
#### 2.2.2 插入
LinkedList 没有像ArrayList中的容量，所以也没有扩容一说，只要把新元素添加到链表上即可
```Java
    public boolean add(E e) {
        linkLast(e);
        return true;
    }

    public void add(int index, E element) {
        checkPositionIndex(index);

        if (index == size)
            linkLast(element);
        else
            linkBefore(element, node(index));
    }

    void linkLast(E e) {
        final Node<E> l = last;
        final Node<E> newNode = new Node<>(l, e, null);
        last = newNode;
        if (l == null)
            first = newNode;
        else
            l.next = newNode;
        size++;
        modCount++;
    }

    void linkBefore(E e, Node<E> succ) {
        final Node<E> pred = succ.prev;
        final Node<E> newNode = new Node<>(pred, e, succ);
        succ.prev = newNode;
        if (pred == null)
            first = newNode;
        else
            pred.next = newNode;
        size++;
        modCount++;
    }
    
```
![图不见了](/images/4.3/2.jpg)
add(E e) 将新节点添加在链表尾部，将当前 last 节点的 next 节点指向新节点，然后将新节点变成 last 节点；如果 last 节点为空，链表为空，新节点变成 first 首节点。

add(int index, E element) 在指定索引处添加新节点，如果 index 为 size，就相当于在添加在链表尾部；不是的话，先调用 node() 方法查询当前 index 位置的 node 节点，然后将新节点添加在该 node 前，改变该 node 节点的 prev 指向新节点以及该 node 节点前驱节点的 next 指向。
#### 2.2.3 删除
```Java
    // 无参remove
    public E remove() {
        return removeFirst();
    }

    public E removeFirst() {
        final Node<E> f = first;
        if (f == null)
            throw new NoSuchElementException();
        return unlinkFirst(f);
    }

    private E unlinkFirst(Node<E> f) {
        final E element = f.item;
        final Node<E> next = f.next;
        f.item = null;
        f.next = null; // help GC
        first = next;
        if (next == null)
            last = null;
        else
            next.prev = null;
        size--;
        modCount++;
        return element;
    }

    // 指定索引remove
    public E remove(int index) {
        checkElementIndex(index);
        return unlink(node(index));
    }

    E unlink(Node<E> x) {
        // assert x != null;
        final E element = x.item;
        final Node<E> next = x.next;
        final Node<E> prev = x.prev;

        if (prev == null) {
            first = next;
        } else {
            prev.next = next;
            x.prev = null;
        }

        if (next == null) {
            last = prev;
        } else {
            next.prev = prev;
            x.next = null;
        }

        x.item = null;
        size--;
        modCount++;
        return element;
    }
```
![图不见了](/images/4.3/3.jpg)
remove()默认删除链表首节点，将首节点的 next 指向的节点变为 first 首节点，将 f.item 、 f.next 和 next.prev 置null是为了虚拟机进行垃圾回收(GC)。

remove(int index) 主要是先通过 node() 方法找到指定索引位置节点，然后判断该节点的前驱和后继节点是否为null，不为null，则将前驱节点的 next 指向后继节点，将后继节点的 prev 指向前驱节点，最后将删除节点的 prev 和 next 置null。
#### 2.2.4 遍历
```Java
    public ListIterator<E> listIterator(int index) {
        checkPositionIndex(index);
        return new ListItr(index);
    }

    private class ListItr implements ListIterator<E> {
        private Node<E> lastReturned;
        private Node<E> next;
        private int nextIndex;
        private int expectedModCount = modCount;

        ListItr(int index) {
            next = (index == size) ? null : node(index);
            nextIndex = index;
        }

        public boolean hasNext() {
            return nextIndex < size;
        }

        public E next() {
            checkForComodification();
            if (!hasNext())
                throw new NoSuchElementException();

            lastReturned = next;
            next = next.next;
            nextIndex++;
            return lastReturned.item;
        }

        //省略部分源码
    }
```
使用 foreach 遍历 LinkedList 时也是转换成迭代器形式，在上面的迭代器实现中，可以看到 new ListItr(index) 时也会先调用 node() 方法定位 next 后继节点的索引位置，效率比较低，然后返回后继节点的 item，最后赋值 next = next.next 将 next 变成后继节点的后继节点， nextIndex++即可。
## 3. 总结
从上面分析中，也不难看出 ArrayList 便于查找，LinkedList 便于增删，源码并不是很复杂，可以耐心看一看。
