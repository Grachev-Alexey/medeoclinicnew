import { db } from "../server/db";
import { storage, slugify } from "../server/storage";
import { hashPassword } from "../server/auth";
import { seedPriceCatalogIfEmpty } from "../server/seedCatalog";
import { DOCTORS_SEED } from "../server/doctorsData";
import {
  users,
  doctors,
  directions,
  services,
  serviceDirections,
  servicePriceItems,
  doctorServices,
  myths,
  promotions,
  stories,
  benefits,
  navLinks,
} from "../shared/schema";

async function seed() {
  /* ----------------------------- Admin user ------------------------------ */
  const existingAdmin = await storage.getUserByUsername("admin");
  if (!existingAdmin) {
    const password = process.env.ADMIN_PASSWORD || "medeo-admin";
    await db.insert(users).values({
      username: "admin",
      password: await hashPassword(password),
    });
    console.log(`✓ Admin created (username: admin, password: ${password})`);
  } else {
    console.log("• Admin already exists, skipping");
  }

  /* ------------------------------ Doctors -------------------------------- */
  if ((await storage.listDoctors()).length === 0) {
    await db.insert(doctors).values(DOCTORS_SEED);
    console.log(`✓ Doctors seeded (${DOCTORS_SEED.length})`);
  }

  /* ----------------------------- Directions ------------------------------ */
  if ((await storage.listDirections()).length === 0) {
    const dirData = [
      { slug: "dentistry", label: "Стоматология", description: "Лечение, протезирование и гигиена полости рта", stat: "до 5 лет", statLabel: "гарантия на лечение", imageUrl: "/image/stomatology.webp", sortOrder: 0, services: ["Лечение кариеса", "Профессиональная гигиена", "Протезирование", "Имплантация", "Отбеливание зубов", "Детская стоматология"] },
      { slug: "cosmetology", label: "Косметология", description: "Уход за кожей, инъекции и аппаратные процедуры", stat: "20+", statLabel: "процедур и методик", imageUrl: "/image/cosmetology.webp", sortOrder: 1, services: ["Чистка лица", "Биоревитализация", "Ботулинотерапия", "Контурная пластика", "Пилинги", "Лазерные процедуры"] },
      { slug: "women", label: "Для женщин", description: "Гинекология, беременность и женское здоровье", stat: "98%", statLabel: "пациентов довольны качеством", imageUrl: "/image/forwoman.webp", sortOrder: 2, services: ["Ведение беременности", "Гинекология", "ЭКО", "УЗИ плода", "Маммология"] },
      { slug: "men", label: "Для мужчин", description: "Урология, андрология и мужской чек-ап", stat: "15+", statLabel: "лет опыта в мужском здоровье", imageUrl: "/image/forman.webp", sortOrder: 3, services: ["Урология", "Андрология", "УЗИ предстательной железы", "Мужской чек-ап", "Онкоскрининг"] },
      { slug: "children", label: "Для детей", description: "Педиатрия, прививки и детские чек-апы", stat: "0–18", statLabel: "лет — принимаем всех детей", imageUrl: "/image/forchild.webp", sortOrder: 4, services: ["Педиатрия", "Прививки", "Логопедия", "Детский чек-ап"] },
    ];
    for (const d of dirData) {
      const { services: svcs, ...dir } = d;
      const [created] = await db.insert(directions).values(dir).returning();
      const inserted = await db
        .insert(services)
        .values(
          svcs.map((name, i) => ({ name, sortOrder: i, slug: slugify(name) })),
        )
        .returning();
      await db.insert(serviceDirections).values(
        inserted.map((s, i) => ({ serviceId: s.id, directionId: created.id, sortOrder: i })),
      );
    }
    console.log("✓ Directions + services seeded");
  }

  /* ------------------------------- Myths --------------------------------- */
  if ((await storage.listMyths()).length === 0) {
    await db.insert(myths).values([
      { tag: "Вирусология", question: "Арбидол и противовирусные лечат простуду?", verdictType: "myth", answer: "Эффективность большинства разрекламированных противовирусных при ОРВИ не подтверждена качественными исследованиями.", source: "ВОЗ, 2023", sortOrder: 0 },
      { tag: "Антибиотики", question: "При температуре нужно пить антибиотики?", verdictType: "myth", answer: "Антибиотики не действуют на вирусы и не нужны при обычной простуде. Они показаны только при доказанной бактериальной инфекции.", source: "CDC, ВОЗ", sortOrder: 1 },
      { tag: "Пульмонология", question: "Зелёная мокрота — значит нужен антибиотик?", verdictType: "myth", answer: "Цвет мокроты не определяет природу инфекции и не является основанием для назначения антибиотиков.", source: "BMJ", sortOrder: 2 },
      { tag: "Нутрициология", question: "Витамин C защищает от простуды?", verdictType: "partial", answer: "Профилактический приём не снижает заболеваемость у большинства людей, но может незначительно сокращать длительность болезни.", source: "Кокрановский обзор", sortOrder: 3 },
      { tag: "Профилактика", question: "Закаливание реально укрепляет иммунитет?", verdictType: "truth", answer: "Регулярное и постепенное закаливание тренирует сосудистую систему и может снижать частоту простудных заболеваний.", source: "NEJM", sortOrder: 4 },
    ]);
    console.log("✓ Myths seeded");
  }

  /* ----------------------------- Promotions ------------------------------ */
  if ((await storage.listPromotions()).length === 0) {
    const svcBySlug = new Map(
      (await db.select().from(services)).map((s) => [s.slug, s.id] as const),
    );
    const ids = (...slugs: string[]) =>
      slugs.map((s) => svcBySlug.get(s)).filter((id): id is string => Boolean(id));

    const promoData = [
      {
        title: "−15% на все виды УЗИ",
        slug: "uzi-skidka-15",
        badge: "−15%",
        date: "до 31 июля 2026",
        description: "Скидка 15% на все ультразвуковые исследования для новых пациентов.",
        intro:
          "Пройдите ультразвуковую диагностику со скидкой 15% — точное исследование на современном оборудовании экспертного класса.",
        body:
          "Акция распространяется на все виды УЗИ в клинике «Медео»: органов брюшной полости, малого таза, щитовидной железы, сосудов, УЗИ плода и предстательной железы.\n\nИсследование проводят врачи ультразвуковой диагностики с большим опытом. Результат вы получаете сразу после процедуры с подробным заключением.\n\nЧтобы воспользоваться скидкой, запишитесь онлайн или по телефону и сообщите администратору про акцию.",
        imageUrl: "/image/promotions/promo-ultrasound.webp",
        heroImageUrl: "/image/promotions/promo-ultrasound.webp",
        serviceIds: ids("uzi-ploda", "uzi-predstatelnoy-zhelezy"),
        metaTitle: "Скидка 15% на УЗИ — ММЦ «Медео»",
        metaDescription:
          "Все виды ультразвуковой диагностики в клинике «Медео» со скидкой 15%. Запишитесь онлайн.",
        featured: true,
        sortOrder: 0,
      },
      {
        title: "SMAS-лифтинг −20% и консультация косметолога в подарок",
        slug: "smas-lifting",
        badge: "−20%",
        date: "до 31 августа 2026",
        description: "Безоперационная подтяжка лица SMAS со скидкой 20% и бесплатной консультацией.",
        intro:
          "SMAS-лифтинг — безоперационная альтернатива подтяжке лица. Скидка 20% и консультация косметолога в подарок.",
        body:
          "SMAS-лифтинг воздействует на глубокий мышечно-апоневротический слой кожи, обеспечивая выраженный эффект подтяжки без операции и реабилитации.\n\nПроцедуру проводит врач-косметолог после индивидуальной консультации, на которой определяются показания и составляется план.\n\nЭффект нарастает в течение нескольких недель и сохраняется надолго. Запишитесь, чтобы получить скидку и бесплатную консультацию.",
        imageUrl: "/image/promotions/promo-smas.webp",
        heroImageUrl: "/image/promotions/promo-smas.webp",
        serviceIds: ids("lazernye-procedury", "konturnaya-plastika"),
        metaTitle: "SMAS-лифтинг со скидкой 20% — ММЦ «Медео»",
        metaDescription:
          "Безоперационный SMAS-лифтинг лица в клинике «Медео» со скидкой 20% и консультацией косметолога в подарок.",
        featured: true,
        sortOrder: 1,
      },
      {
        title: "Абонементы на массаж",
        slug: "abonement-massazh",
        badge: "Абонемент",
        date: "Постоянно",
        description: "Курс массажа по выгодной цене — заботьтесь о здоровье спины регулярно.",
        intro:
          "Приобретайте абонемент на курс массажа и экономьте: регулярные сеансы заметно эффективнее разовых процедур.",
        body:
          "В клинике «Медео» доступны лечебный, расслабляющий и оздоровительный массаж. Абонемент позволяет пройти полноценный курс по выгодной цене.\n\nПрограмму подбирает специалист с учётом вашего состояния и целей — снятие напряжения, профилактика болей в спине, восстановление.\n\nУточните количество сеансов и стоимость абонемента у администратора при записи.",
        imageUrl: "/image/promotions/promo-massage.webp",
        heroImageUrl: "/image/promotions/promo-massage.webp",
        serviceIds: [],
        metaTitle: "Абонементы на массаж — ММЦ «Медео»",
        metaDescription:
          "Курсовые абонементы на массаж в клинике «Медео» по выгодной цене. Запишитесь онлайн.",
        featured: false,
        sortOrder: 2,
      },
      {
        title: "Гинекология: комплексное обследование",
        slug: "ginekologiya-kompleks",
        badge: "Комплекс",
        date: "до 30 сентября 2026",
        description: "Полное обследование у гинеколога с УЗИ по специальной цене.",
        intro:
          "Комплексное гинекологическое обследование: консультация, осмотр и УЗИ — всё для контроля женского здоровья по единой цене.",
        body:
          "Программа включает приём врача-гинеколога, забор анализов и ультразвуковое исследование органов малого таза.\n\nКомплексный подход позволяет вовремя выявить изменения и составить план наблюдения или лечения.\n\nЗапишитесь на удобное время — администратор расскажет, что входит в обследование и как к нему подготовиться.",
        imageUrl: "/image/promotions/promo-consultation.webp",
        heroImageUrl: "/image/promotions/promo-consultation.webp",
        serviceIds: ids("ginekologiya", "uzi-ploda"),
        metaTitle: "Комплексное обследование у гинеколога — ММЦ «Медео»",
        metaDescription:
          "Комплексное гинекологическое обследование с УЗИ в клинике «Медео» по специальной цене.",
        featured: true,
        sortOrder: 3,
      },
      {
        title: "РФ-лифтинг −80% и консультация в подарок",
        slug: "rf-lifting",
        badge: "−80%",
        date: "до 31 августа 2026",
        description: "Радиочастотный лифтинг кожи со скидкой 80% и бесплатной консультацией.",
        intro:
          "РФ-лифтинг подтягивает кожу и разглаживает морщины за счёт радиочастотного прогрева. Скидка 80% на первую процедуру.",
        body:
          "Радиочастотный лифтинг стимулирует выработку собственного коллагена, делая кожу более плотной и упругой. Процедура комфортная и не требует реабилитации.\n\nКосметолог проведёт бесплатную консультацию, оценит состояние кожи и подберёт количество процедур для стойкого результата.\n\nКоличество мест по акции ограничено — запишитесь заранее.",
        imageUrl: "/image/promotions/promo-rf.webp",
        heroImageUrl: "/image/promotions/promo-rf.webp",
        serviceIds: ids("lazernye-procedury", "konturnaya-plastika"),
        metaTitle: "РФ-лифтинг со скидкой 80% — ММЦ «Медео»",
        metaDescription:
          "Радиочастотный РФ-лифтинг кожи в клинике «Медео» со скидкой 80% и консультацией косметолога в подарок.",
        featured: true,
        sortOrder: 4,
      },
      {
        title: "Спецпредложение на консультации врачей",
        slug: "konsultacii-spec",
        badge: "Спеццена",
        date: "до конца года",
        description: "Первичные консультации специалистов по специальной цене до конца года.",
        intro:
          "До конца года первичные консультации врачей клиники «Медео» доступны по специальной цене.",
        body:
          "Предложение действует на первичные приёмы специалистов клиники. Это удобный повод пройти обследование, получить второе мнение или начать наблюдение у нужного врача.\n\nНа приёме врач соберёт анамнез, проведёт осмотр и при необходимости составит план диагностики и лечения.\n\nУточните перечень специалистов, участвующих в акции, у администратора при записи.",
        imageUrl: "/image/promotions/promo-consultation.webp",
        heroImageUrl: "/image/promotions/promo-consultation.webp",
        serviceIds: [],
        metaTitle: "Консультации врачей по спеццене — ММЦ «Медео»",
        metaDescription:
          "Первичные консультации специалистов клиники «Медео» по специальной цене до конца года.",
        featured: false,
        sortOrder: 5,
      },
      {
        title: "«Стань моделью клиники» — косметология −50%",
        slug: "model-kliniki",
        badge: "−50%",
        date: "до 31 июля 2026",
        description: "Скидка 50% на косметологические процедуры для моделей клиники.",
        intro:
          "Станьте моделью клиники «Медео» и получите косметологические процедуры со скидкой 50%.",
        body:
          "Мы приглашаем пациентов поучаствовать в программе «Модель клиники»: вы получаете процедуры со скидкой 50%, а мы — возможность показать результаты нашей работы.\n\nВсе процедуры выполняют опытные врачи-косметологи с соблюдением протоколов безопасности.\n\nУсловия участия и список доступных процедур уточняйте у администратора.",
        imageUrl: "/image/promotions/promo-model.webp",
        heroImageUrl: "/image/promotions/promo-model.webp",
        serviceIds: ids("chistka-lica", "biorevitalizaciya"),
        metaTitle: "Стань моделью клиники — косметология −50% — ММЦ «Медео»",
        metaDescription:
          "Программа «Модель клиники»: косметологические процедуры в «Медео» со скидкой 50%.",
        featured: false,
        sortOrder: 6,
      },
      {
        title: "Увеличение губ VISCOLINE LIPS, 1 мл",
        slug: "uvelichenie-gub",
        badge: "Спеццена",
        date: "до 31 августа 2026",
        description: "Контурная пластика губ препаратом VISCOLINE LIPS по специальной цене.",
        intro:
          "Естественное увеличение и коррекция формы губ препаратом VISCOLINE LIPS (1 мл) по специальной цене.",
        body:
          "Контурная пластика губ помогает добавить объём, скорректировать форму и увлажнить кожу губ. Используется сертифицированный филлер на основе гиалуроновой кислоты.\n\nПроцедуру проводит врач-косметолог после консультации, с учётом ваших пожеланий и анатомии.\n\nЗапишитесь, чтобы уточнить стоимость по акции и подобрать удобное время.",
        imageUrl: "/image/promotions/promo-lips.webp",
        heroImageUrl: "/image/promotions/promo-lips.webp",
        serviceIds: ids("konturnaya-plastika"),
        metaTitle: "Увеличение губ VISCOLINE LIPS — ММЦ «Медео»",
        metaDescription:
          "Контурная пластика и увеличение губ препаратом VISCOLINE LIPS (1 мл) в клинике «Медео» по спеццене.",
        featured: false,
        sortOrder: 7,
      },
      {
        title: "Урология: физиолечение, 10 сеансов — 27 000 ₽",
        slug: "urologiya-fizio",
        badge: "27 000 ₽",
        date: "вместо 35 000 ₽",
        description: "Курс физиотерапии в урологии из 10 сеансов по выгодной цене.",
        intro:
          "Курс физиолечения в урологии из 10 сеансов — 27 000 ₽ вместо 35 000 ₽. Эффективная поддержка мужского здоровья.",
        body:
          "Физиотерапия применяется в комплексном лечении урологических заболеваний: помогает снять воспаление, улучшить кровообращение и закрепить результат основного лечения.\n\nКурс назначает врач-уролог после осмотра и обследования, с учётом показаний и противопоказаний.\n\nЗапишитесь на консультацию, чтобы начать курс по акционной цене.",
        imageUrl: "/image/promotions/promo-urology.webp",
        heroImageUrl: "/image/promotions/promo-urology.webp",
        serviceIds: ids("urologiya", "andrologiya"),
        metaTitle: "Физиолечение в урологии, 10 сеансов — ММЦ «Медео»",
        metaDescription:
          "Курс физиотерапии в урологии из 10 сеансов в клинике «Медео» — 27 000 ₽ вместо 35 000 ₽.",
        featured: false,
        sortOrder: 8,
      },
      {
        title: "Устраним второй подбородок за одну процедуру",
        slug: "vtoroy-podborodok",
        badge: "За 1 визит",
        date: "до 31 августа 2026",
        description: "Коррекция второго подбородка и овала лица всего за одну процедуру.",
        intro:
          "Избавьтесь от второго подбородка за одну процедуру — современная коррекция овала лица без операции.",
        body:
          "Коррекция зоны подбородка помогает убрать локальные жировые отложения и подтянуть овал лица. Метод подбирается индивидуально на консультации косметолога.\n\nПроцедура проходит комфортно и не требует длительного восстановления, а результат заметен уже после первого визита.\n\nЗапишитесь на консультацию, чтобы подобрать оптимальное решение и узнать стоимость.",
        imageUrl: "/image/promotions/promo-chin.webp",
        heroImageUrl: "/image/promotions/promo-chin.webp",
        serviceIds: ids("konturnaya-plastika", "lazernye-procedury"),
        metaTitle: "Коррекция второго подбородка за 1 процедуру — ММЦ «Медео»",
        metaDescription:
          "Коррекция второго подбородка и овала лица за одну процедуру в клинике «Медео». Запишитесь онлайн.",
        featured: false,
        sortOrder: 9,
      },
    ];

    await db.insert(promotions).values(promoData);
    console.log("✓ Promotions seeded");
  }

  /* ------------------------------ Stories -------------------------------- */
  if ((await storage.listStories()).length === 0) {
    await db.insert(stories).values([
      {
        tag: "Гинекология · острый случай",
        title: "УЗИ, которое спасло жизнь",
        imageUrl: "",
        body: "Пациентка пришла на УЗИ к гинекологу Светлане Александровне Няниной с жалобами на боль внизу живота. Врач заподозрила острый аппендицит и воспаление в малом тазу — и, не теряя времени, вызвала бригаду скорой помощи.\n\nПациентку срочно госпитализировали и в тот же день прооперировали.",
        noteKind: "quote",
        noteLabel: "Первое сообщение — в тот же вечер из больницы",
        noteText: "«Прооперировали: удалили маточные трубы и аппендикс. Пельвеоперитонит и аппендицит вместе».",
        author: "Светлана Александровна Нянина · врач-гинеколог",
        sortOrder: 0,
      },
      {
        tag: "Урология · клинический случай",
        title: "Когда нельзя откладывать визит",
        imageUrl: "",
        body: "Мужчина 52 лет обратился с затруднённым мочеиспусканием и болью в уретре, которая длилась уже пять дней. С мочой начали отходить камни: один вышел самостоятельно, а второй застрял в мочеиспускательном канале.\n\nПри осмотре врач прощупал плотное образование и аккуратно извлёк камень специальным зажимом — размером 1,3 × 0,9 см.",
        noteKind: "info",
        noteLabel: "Если камень не извлечь консервативно",
        noteText: "В условиях стационара проводят оптическую уретролитотомию — малоинвазивную операцию, которая безопасно удаляет конкремент из мочеиспускательного канала.",
        author: "Урологический приём ММЦ «МЕДЕО»",
        sortOrder: 1,
      },
    ]);
    console.log("✓ Stories seeded");
  }

  /* ------------------------------ Benefits ------------------------------- */
  if ((await storage.listBenefits()).length === 0) {
    await db.insert(benefits).values([
      { title: "Доказательная медицина", text: "Забота, основанная на доказательной медицине и проверенных протоколах.", icon: "shield-check", sortOrder: 0 },
      { title: "Для всей семьи", text: "Мы рядом на любом этапе жизни — от детей до взрослых.", icon: "users", sortOrder: 1 },
      { title: "Современные технологии", text: "Современное оборудование экспертного класса для точной и быстрой диагностики.", icon: "cpu", sortOrder: 2 },
      { title: "Внимание к деталям", text: "Вкусный чай, носочки, юбочки — заботимся о комфорте.", icon: "heart", sortOrder: 3 },
    ]);
    console.log("✓ Benefits seeded");
  }

  /* ------------------------------ Nav links ------------------------------ */
  if ((await storage.listNavLinks()).length === 0) {
    await db.insert(navLinks).values([
      { label: "О клинике", href: "/o-klinike", group: "main", sortOrder: 0 },
      { label: "Услуги", href: "#services", group: "main", sortOrder: 1 },
      { label: "Врачи", href: "/vrachi", group: "main", sortOrder: 2 },
      { label: "Пациентам", href: "/patients", group: "main", sortOrder: 3 },
      { label: "Цены", href: "/prices", group: "main", sortOrder: 4 },
      { label: "Акции", href: "/akcii", group: "main", sortOrder: 5 },
      { label: "Контакты", href: "/contacts", group: "main", sortOrder: 6 },
      { label: "Вызов на дом", href: "#", group: "secondary", sortOrder: 1 },
      { label: "ДМС", href: "#", group: "secondary", sortOrder: 2 },
      { label: "Результаты анализов", href: "#", group: "secondary", sortOrder: 3 },
      { label: "О лицензии", href: "/licenziya", group: "secondary", sortOrder: 4 },
      { label: "Вакансии", href: "#", group: "secondary", sortOrder: 5 },
    ]);
    console.log("✓ Nav links seeded");
  }

  /* --------------------- Prices (реальный каталог) ----------------------- */
  if (await seedPriceCatalogIfEmpty()) {
    console.log("✓ Каталог «Услуги и цены» заполнен реальными данными");
  } else {
    console.log("• Каталог уже заполнен, пропускаю");
  }

  /* ----------- Связь услуг с конкретными позициями прайса (идемпотентно) -- */
  // Вместо bulk-линковки всех позиций категории — только точное совпадение
  // по подстроке названия услуги, чтобы не тащить чужие процедуры.
  {
    const SERVICE_NAME_FILTERS: Record<string, string[]> = {
      "Гинекология": ["Первичный приём врача акушера-гинеколога", "Повторный приём врача акушера-гинеколога"],
      "Урология":    ["Первичный приём врача уролога", "Повторный приём врача уролога"],
      "Андрология":  ["Первичный приём врача уролога-андролога", "Повторный приём врача уролога-андролога"],
    };
    const allItems = await storage.listPriceItems();
    const allServices = await db.select().from(services);
    const existingLinks = await storage.listServicePriceItems();
    const linkedSvc = new Set(existingLinks.map((l) => l.serviceId));
    let linked = 0;
    for (const s of allServices) {
      if (linkedSvc.has(s.id)) continue;
      const nameFilters = SERVICE_NAME_FILTERS[s.name];
      if (!nameFilters) continue;
      const itemIds = allItems
        .filter((i) => nameFilters.some((f) => i.name.includes(f)))
        .map((i) => i.id);
      if (itemIds.length === 0) continue;
      await storage.setServicePriceItems(s.id, itemIds);
      linked++;
    }
    if (linked) console.log(`✓ Услуги связаны с позициями прайса (${linked})`);
  }

  /* ------- Сквозные услуги в нескольких направлениях (идемпотентно) ------ */
  // Часть услуг логично показывать сразу в нескольких аудиторных разделах
  // (например, эстетические процедуры — и «Для женщин», и «Для мужчин»).
  // Услуга редактируется один раз, а появляется в каждом из направлений.
  // Первое направление (исходное) остаётся primary — задаёт акцент страницы.
  {
    const CROSS_CUTTING: Record<string, string[]> = {
      // Косметология востребована и в женском, и в мужском разделах
      "chistka-lica": ["women", "men"],
      "botulinoterapiya": ["women", "men"],
      "lazernye-procedury": ["women", "men"],
      "biorevitalizaciya": ["women"],
      "konturnaya-plastika": ["women"],
      "pilingi": ["women"],
      // Онкоскрининг актуален не только для мужчин
      "onkoskrining": ["women"],
    };
    const allServices = await db.select().from(services);
    const svcBySlug = new Map(allServices.map((s) => [s.slug, s.id] as const));
    const dirBySlug = new Map(
      (await storage.listDirections(false)).map((d) => [d.slug, d.id] as const),
    );
    const links = await storage.listServiceDirections();
    const linksBySvc = new Map<string, Set<string>>();
    const countBySvc = new Map<string, number>();
    for (const l of links) {
      if (!linksBySvc.has(l.serviceId)) linksBySvc.set(l.serviceId, new Set());
      linksBySvc.get(l.serviceId)!.add(l.directionId);
      countBySvc.set(l.serviceId, (countBySvc.get(l.serviceId) ?? 0) + 1);
    }
    const toInsert: Array<{ serviceId: string; directionId: string; sortOrder: number }> = [];
    for (const [svcSlug, dirSlugs] of Object.entries(CROSS_CUTTING)) {
      const serviceId = svcBySlug.get(svcSlug);
      if (!serviceId) continue;
      const existing = linksBySvc.get(serviceId) ?? new Set<string>();
      let order = countBySvc.get(serviceId) ?? 0;
      for (const dirSlug of dirSlugs) {
        const directionId = dirBySlug.get(dirSlug);
        if (!directionId || existing.has(directionId)) continue;
        toInsert.push({ serviceId, directionId, sortOrder: order++ });
        existing.add(directionId);
      }
    }
    if (toInsert.length) {
      await db.insert(serviceDirections).values(toInsert).onConflictDoNothing();
      console.log(`✓ Сквозные услуги связаны с доп. направлениями (${toInsert.length})`);
    }
  }

  /* -------- Разделы-специальности из категорий прайса (идемпотентно) ------ */
  // Каждая «осиротевшая» категория прайса (нет аудиторного раздела) становится
  // отдельным разделом сайта (kind='specialty'), напрямую связанным с категорией.
  {
    const SPECIALTY_SECTIONS: Array<{
      category: string; slug: string; label: string; heroTitle: string;
      intro: string; description: string; accent: string;
    }> = [
      { category: "ЛОР", slug: "lor", label: "ЛОР", heroTitle: "ЛОР — лечение уха, горла и носа",
        intro: "Диагностика и лечение заболеваний уха, горла и носа у взрослых и детей.",
        description: "Лечение уха, горла и носа", accent: "#0e7490" },
      { category: "Дерматология", slug: "dermatologiya", label: "Дерматология", heroTitle: "Дерматология и лечение кожи",
        intro: "Диагностика и лечение заболеваний кожи, волос и ногтей.",
        description: "Диагностика и лечение кожи", accent: "#a16207" },
      { category: "Функциональная диагностика", slug: "funkcionalnaya-diagnostika", label: "Функциональная диагностика", heroTitle: "Функциональная диагностика",
        intro: "ЭКГ, СМАД, холтер и другие функциональные исследования.",
        description: "ЭКГ, холтер, СМАД и другие исследования", accent: "#0f766e" },
      { category: "Лабораторные анализы", slug: "laboratornye-analizy", label: "Лабораторные анализы", heroTitle: "Лабораторные анализы",
        intro: "Широкий спектр лабораторных исследований и анализов.",
        description: "Анализы и лабораторные исследования", accent: "#6d28d9" },
      { category: "Мануальная терапия и массаж", slug: "massazh-i-manualnaya-terapiya", label: "Массаж и мануальная терапия", heroTitle: "Массаж и мануальная терапия",
        intro: "Лечебный массаж и мануальная терапия для здоровья спины и суставов.",
        description: "Лечебный массаж и мануальная терапия", accent: "#9d174d" },
      { category: "Процедурный кабинет", slug: "procedurnyy-kabinet", label: "Процедурный кабинет", heroTitle: "Процедурный кабинет",
        intro: "Инъекции, капельницы и медицинские манипуляции.",
        description: "Инъекции, капельницы, манипуляции", accent: "#155e75" },
      { category: "Медицинские справки и документы", slug: "spravki-i-dokumenty", label: "Справки и документы", heroTitle: "Медицинские справки и документы",
        intro: "Оформление медицинских справок и документов.",
        description: "Оформление медицинских справок", accent: "#374151" },
    ];
    const cats = await storage.listPriceCategories();
    const catByName = new Map(cats.map((c) => [c.name, c.id] as const));
    const existing = new Set((await storage.listDirections(false)).map((d) => d.slug));
    let created = 0;
    let baseOrder = 5;
    for (const sec of SPECIALTY_SECTIONS) {
      if (existing.has(sec.slug)) continue;
      const catId = catByName.get(sec.category);
      if (!catId) continue;
      await db.insert(directions).values({
        slug: sec.slug, label: sec.label, description: sec.description,
        heroTitle: sec.heroTitle, intro: sec.intro, accent: sec.accent,
        kind: "specialty", priceCategoryId: catId, sortOrder: baseOrder++,
        metaTitle: `${sec.label} — ММЦ МЕДЕО`, metaDescription: sec.intro,
      });
      created++;
    }
    if (created) console.log(`✓ Разделы-специальности созданы (${created})`);
  }

  /* ---------------------- Doctor ↔ service links ------------------------- */
  {
    const existingLinks = await db.select().from(doctorServices);
    if (existingLinks.length === 0) {
      const svcBySlug = new Map(
        (await db.select().from(services)).map((s) => [s.slug, s.id] as const),
      );
      const docBySlug = new Map(
        (await db.select().from(doctors)).map((d) => [d.slug, d.id] as const),
      );
      const svc = (...slugs: string[]) =>
        slugs.map((s) => svcBySlug.get(s)).filter((id): id is string => Boolean(id));

      const DOCTOR_SERVICE_MAP: Record<string, string[]> = {
        "gashimova-selminaz-kamilovna":      svc("urologiya", "andrologiya", "uzi-predstatelnoy-zhelezy"),
        "nishanhozhaeva-elgiza-ikramhozhaevna": svc("uzi-ploda", "uzi-predstatelnoy-zhelezy"),
        "nyanina-svetlana-aleksandrovna":    svc("vedenie-beremennosti", "ginekologiya", "uzi-ploda"),
        "sorokina-svetlana-viktorovna":      svc("chistka-lica", "biorevitalizaciya", "botulinoterapiya", "konturnaya-plastika", "pilingi"),
        "susenko-inna-valerevna":            svc("uzi-ploda", "uzi-predstatelnoy-zhelezy"),
        "finogenova-tatyana-sergeevna":      svc("chistka-lica", "biorevitalizaciya", "botulinoterapiya", "lazernye-procedury"),
        "cherkashin-vladimir-dmitrievich":   svc("uzi-predstatelnoy-zhelezy", "uzi-ploda"),
      };

      const rows: { doctorId: string; serviceId: string; sortOrder: number }[] = [];
      for (const [docSlug, serviceIds] of Object.entries(DOCTOR_SERVICE_MAP)) {
        const doctorId = docBySlug.get(docSlug);
        if (!doctorId) continue;
        serviceIds.forEach((serviceId, i) => rows.push({ doctorId, serviceId, sortOrder: i }));
      }
      if (rows.length > 0) {
        await db.insert(doctorServices).values(rows);
        console.log(`✓ Doctor-service links seeded (${rows.length})`);
      }
    } else {
      console.log("• Doctor-service links already exist, skipping");
    }
  }

  /* --------------------------- Site settings ----------------------------- */
  const existingHero = await storage.getSetting("hero");
  if (!existingHero) {
    await storage.setSetting("hero", {
      tagline: "Клиника доказательной медицины",
      headline: "Медицина без лишних анализов и пугающих диагнозов",
      subheadline: "Назначаем только препараты с доказанной эффективностью. Бережно относимся к вашему времени и бюджету.",
      imageUrl: "/image/hero.webp",
    });
    await storage.setSetting("branding", { name: "МЕДЕО", tagline: "МЕДИЦИНСКИЙ ЦЕНТР" });
    await storage.setSetting("contacts", {
      phones: ["+7 (991) 300-95-05", "+7 (495) 198-05-08"],
      address: "Ул. 6-я Радиальная, 5, корп. 2, м. Царицыно, Москва",
      schedule: [
        { days: "Пн–Пт", hours: "08:00–21:00" },
        { days: "Суббота", hours: "09:00–21:00" },
        { days: "Воскресенье", hours: "09:00–21:00" },
      ],
      entity: "ООО Медицинский центр «МЕДЕО»",
      license: "№ ЛО-77-01-020186 от 3 августа 2020 года",
    });
    await storage.setSetting("rating", { value: "4.9", count: "более 2 000 отзывов" });
    console.log("✓ Site settings seeded");
  }

  console.log("\n✅ Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
