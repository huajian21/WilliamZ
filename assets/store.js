/* ============================================================
   纳里 · H5 Demo 数据层 (store.js)
   封装 localStorage 读写 + 种子数据 + CRUD API
   所有页面通过 <script src="../assets/store.js"></script> 引入
   全局对象: DB
   ============================================================ */

const DB = (() => {
  const KEY = 'nali_data_v1';
  let cache = null;

  // ===== 内部：读写 localStorage =====
  function load() {
    if (cache) return cache;
    const raw = localStorage.getItem(KEY);
    if (raw) {
      cache = JSON.parse(raw);
    } else {
      cache = seed();
      save();
    }
    return cache;
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(cache));
  }

  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  // ===== 种子数据 =====
  function seed() {
    const now = Date.now();
    const placeHome = 'place_home';
    const placeRv = 'place_rv';
    const placeStudio = 'place_studio';
    const userMe = 'user_me';

    const data = {
      user: {
        id: userMe,
        openid: 'mock_openid',
        nickname: '花间',
        avatarUrl: '../assets/hjlogo.jpg',
        currentPlaceId: placeHome,
        createdAt: now,
      },
      places: [
        { id: placeHome, name: '我们家', type: 'home', ownerId: userMe, iconClass: 'pi-home', createdAt: now },
        { id: placeRv, name: '房车', type: 'rv', ownerId: userMe, iconClass: 'pi-rv', createdAt: now },
        { id: placeStudio, name: '工作室', type: 'studio', ownerId: userMe, iconClass: 'pi-studio', createdAt: now },
      ],
      members: [
        { id: 'm_me', ownerId: userMe, userId: userMe, nickname: '花间', avatarUrl: '../assets/hjlogo.jpg', role: '主人', accessiblePlaceIds: [], joinTime: now },
        { id: 'm_mm', ownerId: userMe, userId: 'user_mm', nickname: '梅梅', avatarUrl: '../assets/mmlogo.jpg', role: '女主人', accessiblePlaceIds: [], joinTime: now - 86400000 * 12 },
      ],
      rooms: [],
      furnitures: [],
      locations: [],
      categories: [],
      items: [],
      _seedRooms: true,
    };

    // 房间
    const homeRooms = [
      { id: uid('room'), placeId: placeHome, name: '客厅', emoji: '🛋️', sortOrder: 1 },
      { id: uid('room'), placeId: placeHome, name: '主卧', emoji: '🛏️', sortOrder: 2 },
      { id: uid('room'), placeId: placeHome, name: '厨房', emoji: '🍳', sortOrder: 3 },
      { id: uid('room'), placeId: placeHome, name: '书房', emoji: '📖', sortOrder: 4 },
      { id: uid('room'), placeId: placeHome, name: '卫生间', emoji: '🚿', sortOrder: 5 },
    ];
    const rvRooms = [
      { id: uid('room'), placeId: placeRv, name: '驾驶区', emoji: '🪑', sortOrder: 1 },
      { id: uid('room'), placeId: placeRv, name: '生活区', emoji: '🛏️', sortOrder: 2 },
      { id: uid('room'), placeId: placeRv, name: '迷你厨房', emoji: '🍳', sortOrder: 3 },
    ];
    const studioRooms = [
      { id: uid('room'), placeId: placeStudio, name: '裁剪台', emoji: '✂️', sortOrder: 1 },
      { id: uid('room'), placeId: placeStudio, name: '缝制区', emoji: '🪡', sortOrder: 2 },
      { id: uid('room'), placeId: placeStudio, name: '皮料库', emoji: '🐄', sortOrder: 3 },
      { id: uid('room'), placeId: placeStudio, name: '五金柜', emoji: '🔩', sortOrder: 4 },
      { id: uid('room'), placeId: placeStudio, name: '成品仓', emoji: '📦', sortOrder: 5 },
    ];
    data.rooms = [...homeRooms, ...rvRooms, ...studioRooms];

    // 家具（关联房间）
    const furnData = [
      // 家
      [homeRooms[0], '电视柜', 8], [homeRooms[0], '茶几', 6], [homeRooms[0], '沙发收纳', 4],
      [homeRooms[1], '衣柜', 22], [homeRooms[1], '床头柜', 8], [homeRooms[1], '梳妆台', 10],
      [homeRooms[2], '橱柜(上)', 6], [homeRooms[2], '橱柜(下)', 5], [homeRooms[2], '冰箱', 8],
      [homeRooms[3], '书架', 12], [homeRooms[3], '书桌抽屉', 4],
      [homeRooms[4], '浴室柜', 6], [homeRooms[4], '镜柜', 4],
      // 房车
      [rvRooms[0], '中控储物盒', 3], [rvRooms[0], '手套箱', 3],
      [rvRooms[1], '顶置行李柜', 6], [rvRooms[1], '床底抽屉', 6],
      [rvRooms[2], '车载冰箱', 2], [rvRooms[2], '微型橱柜', 2],
      // 工作室
      [studioRooms[0], '裁剪大桌', 12], [studioRooms[0], '样板柜', 8],
      [studioRooms[1], '缝纫机台', 15], [studioRooms[1], '线轴架', 18],
      [studioRooms[2], '皮料货架', 28], [studioRooms[2], '边角料箱', 12],
      [studioRooms[3], '五金零件柜', 21], [studioRooms[3], '模具架', 6],
      [studioRooms[4], '成品展示架', 10], [studioRooms[4], '打包台', 5],
    ];
    data.furnitures = furnData.map(([room, name, _]) => ({
      id: uid('furn'), placeId: room.placeId, roomId: room.id, name, sortOrder: 0,
    }));

    // 分类（按场所独立）
    const catTemplates = {
      home: [
        { name: '衣物', emoji: '👕', subs: [['上衣','👕'],['裤子','👖'],['内衣','🩲'],['配饰','🧣']] },
        { name: '食品', emoji: '🍱', subs: [['干货','🍚'],['冷冻','🧊'],['冷藏','🥛'],['调味品','🧂']] },
        { name: '书籍', emoji: '📚', subs: null },
        { name: '数码', emoji: '📱', subs: [['充电设备','🔋'],['线材','🔌'],['配件','🎧']] },
        { name: '日用品', emoji: '🧴', subs: [['纸品','🧻'],['洗护','🧼'],['囤货','📦']] },
        { name: '厨房用品', emoji: '🍳', subs: [['餐具','🍴'],['锅具','🍲'],['小家电','⚡']] },
        { name: '清洁用品', emoji: '🧹', subs: null },
        { name: '医药健康', emoji: '💊', subs: [['常用药','💊'],['急救用品','🩹']] },
      ],
      studio: [
        { name: '皮料', emoji: '🐄', subs: [['头层牛皮','🐄'],['二层皮','🐂'],['植鞣革','🟤']] },
        { name: '五金', emoji: '🔩', subs: [['锁扣','🔒'],['铆钉','🔩'],['拉链','🤐']] },
        { name: '缝纫工具', emoji: '🪡', subs: [['缝针','🪡'],['缝线','🧵'],['菱斩','🔧']] },
        { name: '裁剪工具', emoji: '✂️', subs: [['美工刀','🔪'],['剪刀','✂️']] },
        { name: '辅料', emoji: '📦', subs: [['边油','🎨'],['胶水','🧴']] },
        { name: '成品', emoji: '🎁', subs: [['钱包','👛'],['包袋','👜']] },
      ],
      rv: [
        { name: '车载用品', emoji: '🚗', subs: [['充电','🔋'],['导航','🧭']] },
        { name: '露营装备', emoji: '⛺', subs: [['帐篷','⛺'],['睡袋','🛌']] },
        { name: '厨房', emoji: '🍳', subs: [['餐具','🍴'],['食材','🥫']] },
        { name: '衣物', emoji: '👕', subs: [['换洗','👕'],['防护','🧥']] },
        { name: '应急', emoji: '🆘', subs: [['急救','🩹'],['备件','⚙️']] },
      ],
    };

    Object.entries(catTemplates).forEach(([type, cats]) => {
      const place = data.places.find(p => p.type === type);
      if (!place) return;
      cats.forEach((c, i) => {
        const topId = uid('cat');
        data.categories.push({ id: topId, placeId: place.id, parentId: null, name: c.name, icon: c.emoji, sortOrder: i, isPreset: true, level: 1 });
        if (c.subs) {
          c.subs.forEach((s, j) => {
            data.categories.push({ id: uid('cat'), placeId: place.id, parentId: topId, name: s[0], icon: s[1], sortOrder: j, isPreset: true, level: 2 });
          });
        }
      });
    });

    // 物品（示例，关联家和分类）
    const homeCats = data.categories.filter(c => c.placeId === placeHome);
    const itemData = [
      ['灰色卫衣', '衣物', '上衣', homeRooms[1], '衣柜', '中层', 2, 128, 'photo-1626965556114-27c91c051269', '去年买的,有点起球'],
      ['黑色卫衣', '衣物', '上衣', homeRooms[0], '电视柜', '', 1, 99, 'photo-1556909114-f6e7ad7d3136', ''],
      ['充电宝', '数码', '充电设备', homeRooms[0], '电视柜', '', 1, 79, 'photo-1607809714110-e34f71c7b2ed', '20000mAh'],
      ['厨房纸巾', '日用品', '纸品', homeRooms[2], '橱柜(下)', '', 3, 15, 'photo-1522444195799-478538b28823', ''],
      ['设计心理学', '书籍', '', homeRooms[3], '书架', '第二层', 1, 68, 'photo-1605774337664-7a846e9cdf17', '经典'],
      ['牛仔裤', '衣物', '裤子', homeRooms[1], '衣柜', '下层', 2, 199, 'photo-1556909114-f6e7ad7d3136', ''],
      ['陶瓷碗', '厨房用品', '餐具', homeRooms[2], '橱柜(上)', '', 6, 12, 'photo-1556909212-d5b604d0c90d', ''],
    ];

    data.items = itemData.map(([name, catName, subName, room, furnName, loc, qty, price, img, remark]) => {
      const cat = homeCats.find(c => c.name === catName && c.level === 1);
      const sub = subName ? homeCats.find(c => c.name === subName && c.level === 2) : null;
      const furn = data.furnitures.find(f => f.roomId === room.id && f.name === furnName);
      return {
        id: uid('item'),
        placeId: placeHome,
        name,
        photos: [`https://images.unsplash.com/${img}?w=400&q=70&auto=format&fit=crop`],
        quantity: qty,
        price,
        categoryId: cat ? cat.id : null,
        categoryName: subName ? `${catName}/${subName}` : catName,
        furnitureId: furn ? furn.id : null,
        furnitureName: furnName,
        locationName: loc,
        locationPath: `${room.name}/${furnName}${loc ? '/' + loc : ''}`,
        remark,
        createdBy: userMe,
        createdByName: '花间',
        createdAt: now - Math.floor(Math.random() * 86400000 * 7),
        updatedAt: now,
        isDeleted: false,
      };
    });

    return data;
  }

  // ===== 公共 API =====
  return {
    init: load,
    reset: () => { cache = seed(); save(); },

    // 用户
    getUser: () => load().user,
    updateUser: (patch) => { Object.assign(load().user, patch); save(); },
    isLoggedIn: () => !!load().user,

    // 场所
    getPlaces: () => load().places,
    getPlace: (id) => load().places.find(p => p.id === id),
    getCurrentPlace: () => {
      const d = load();
      return d.places.find(p => p.id === d.user.currentPlaceId) || d.places[0];
    },
    setCurrentPlace: (id) => { load().user.currentPlaceId = id; save(); },
    addPlace: (name, type, iconClass) => {
      const d = load();
      if (d.places.length >= 3) return null;
      const p = { id: uid('place'), name, type, ownerId: d.user.id, iconClass, createdAt: Date.now() };
      d.places.push(p);
      save();
      return p;
    },
    updatePlace: (id, patch) => {
      const d = load();
      const p = d.places.find(x => x.id === id);
      if (p) { Object.assign(p, patch); save(); }
      return p;
    },
    clearPlaceItems: (placeId) => {
      const d = load();
      d.items = d.items.filter(i => i.placeId !== placeId);
      save();
    },
    deletePlace: (placeId) => {
      const d = load();
      if (d.places.length <= 1) return false;
      d.rooms = d.rooms.filter(r => r.placeId !== placeId);
      d.furnitures = d.furnitures.filter(f => f.placeId !== placeId);
      d.categories = d.categories.filter(c => c.placeId !== placeId);
      d.items = d.items.filter(i => i.placeId !== placeId);
      d.places = d.places.filter(p => p.id !== placeId);
      if (d.user.currentPlaceId === placeId) d.user.currentPlaceId = d.places[0].id;
      save();
      return true;
    },
    exportPlace: (placeId) => {
      const d = load();
      return {
        place: d.places.find(p => p.id === placeId),
        rooms: d.rooms.filter(r => r.placeId === placeId),
        furnitures: d.furnitures.filter(f => f.placeId === placeId),
        categories: d.categories.filter(c => c.placeId === placeId),
        items: d.items.filter(i => i.placeId === placeId),
      };
    },

    // 成员
    getMembers: () => load().members,
    addMember: (nickname) => {
      const d = load();
      const m = { id: uid('m'), ownerId: d.user.id, userId: uid('u'), nickname, avatarUrl: '', role: '成员', accessiblePlaceIds: [], joinTime: Date.now() };
      d.members.push(m); save(); return m;
    },
    updateMemberAccess: (memberId, placeIds) => {
      const d = load();
      const m = d.members.find(x => x.id === memberId);
      if (m) { m.accessiblePlaceIds = placeIds; save(); }
    },
    removeMember: (memberId) => {
      const d = load();
      d.members = d.members.filter(x => x.id !== memberId);
      save();
    },

    // 房间
    getRooms: (placeId) => load().rooms.filter(r => r.placeId === placeId).sort((a, b) => a.sortOrder - b.sortOrder),
    getRoom: (id) => load().rooms.find(r => r.id === id),
    addRoom: (placeId, name, emoji) => {
      const d = load();
      const r = { id: uid('room'), placeId, name, emoji: emoji || '🚪', sortOrder: d.rooms.filter(r => r.placeId === placeId).length + 1 };
      d.rooms.push(r); save(); return r;
    },
    updateRoom: (id, patch) => {
      const d = load();
      const r = d.rooms.find(r => r.id === id);
      if (r) { Object.assign(r, patch); save(); }
      return r;
    },
    deleteRoom: (id) => {
      const d = load();
      // 级联：房间下家具置空 roomId（保留物品引用历史），移除房间
      d.furnitures.filter(f => f.roomId === id).forEach(f => { f.roomId = null; });
      d.rooms = d.rooms.filter(r => r.id !== id);
      save();
    },

    // 家具
    getFurnitures: (placeId) => load().furnitures.filter(f => f.placeId === placeId),
    getFurnituresByRoom: (roomId) => load().furnitures.filter(f => f.roomId === roomId),
    getFurniture: (id) => load().furnitures.find(f => f.id === id),
    addFurniture: (placeId, roomId, name) => {
      const d = load();
      const f = { id: uid('furn'), placeId, roomId, name, sortOrder: 0 };
      d.furnitures.push(f); save(); return f;
    },
    updateFurniture: (id, patch) => {
      const d = load();
      const f = d.furnitures.find(f => f.id === id);
      if (f) { Object.assign(f, patch); save(); }
      return f;
    },
    deleteFurniture: (id) => {
      const d = load();
      // 物品引用置空，保留物品
      d.items.filter(i => i.furnitureId === id).forEach(i => { i.furnitureId = null; i.furnitureName = ''; });
      d.furnitures = d.furnitures.filter(f => f.id !== id);
      save();
    },

    // 分类
    getCategories: (placeId) => load().categories.filter(c => c.placeId === placeId),
    getTopCategories: (placeId) => load().categories.filter(c => c.placeId === placeId && !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder),
    getSubCategories: (parentId) => load().categories.filter(c => c.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder),
    getCategory: (id) => load().categories.find(c => c.id === id),
    addCategory: (placeId, name, parentId = null, icon = '🏷️') => {
      const d = load();
      const siblings = d.categories.filter(c => c.placeId === placeId && c.parentId === parentId);
      const c = { id: uid('cat'), placeId, name, parentId, icon, sortOrder: siblings.length + 1, level: parentId ? 2 : 1 };
      d.categories.push(c); save(); return c;
    },
    updateCategory: (id, patch) => {
      const d = load();
      const c = d.categories.find(c => c.id === id);
      if (c) { Object.assign(c, patch); save(); }
      return c;
    },
    deleteCategory: (id) => {
      const d = load();
      // 子分类一并删除；物品引用置空（保留 categoryName 显示）
      d.categories = d.categories.filter(c => c.id !== id && c.parentId !== id);
      save();
    },

    // 物品
    getItems: (placeId, filter = {}) => {
      let items = load().items.filter(i => i.placeId === placeId && !i.isDeleted);
      if (filter.categoryId) items = items.filter(i => i.categoryId === filter.categoryId);
      if (filter.furnitureId) items = items.filter(i => i.furnitureId === filter.furnitureId);
      if (filter.keyword) {
        const kw = filter.keyword.toLowerCase();
        items = items.filter(i => i.name.toLowerCase().includes(kw) || (i.categoryName || '').toLowerCase().includes(kw));
      }
      return items.sort((a, b) => b.createdAt - a.createdAt);
    },
    getItem: (id) => load().items.find(i => i.id === id),
    addItem: (data) => {
      const d = load();
      const placeId = d.user.currentPlaceId;
      const item = {
        id: uid('item'),
        placeId,
        name: data.name,
        photos: data.photos || [],
        quantity: data.quantity || 1,
        price: data.price || 0,
        categoryId: data.categoryId || null,
        categoryName: data.categoryName || '',
        furnitureId: data.furnitureId || null,
        furnitureName: data.furnitureName || '',
        locationName: data.locationName || '',
        locationPath: data.locationPath || '',
        remark: data.remark || '',
        createdBy: d.user.id,
        createdByName: d.user.nickname,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isDeleted: false,
      };
      d.items.push(item); save(); return item;
    },
    updateItem: (id, patch) => {
      const d = load();
      const item = d.items.find(i => i.id === id);
      if (item) { Object.assign(item, patch, { updatedAt: Date.now() }); save(); }
      return item;
    },
    deleteItem: (id) => {
      const d = load();
      const item = d.items.find(i => i.id === id);
      if (item) { item.isDeleted = true; save(); }
    },

    // 统计
    getStats: (placeId) => {
      const d = load();
      const items = d.items.filter(i => i.placeId === placeId && !i.isDeleted);
      const furns = d.furnitures.filter(f => f.placeId === placeId);
      const cats = d.categories.filter(c => c.placeId === placeId && c.parentId); // 子分类数
      const totalValue = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
      return {
        itemCount: items.length,
        furnCount: furns.length,
        roomCount: d.rooms.filter(r => r.placeId === placeId).length,
        subcatCount: cats.length,
        totalValue,
        items,
      };
    },
  };
})();
