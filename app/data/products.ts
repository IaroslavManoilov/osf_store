export type ProductCategory = 'sweaters' | 'hoodies' | 'polo'
export type ProductColor = 'white' | 'black'
export type ProductSize = 'S' | 'M' | 'L'
export type ProductBadge = 'NEW' | 'HOT'
export type LocaleCode = 'ru' | 'ro' | 'en'

export type LocalizedProduct = {
  id: string
  price: number
  badge: ProductBadge
  category: ProductCategory
  color: ProductColor
  sizes: ProductSize[]
  image: string
  images: string[]
  title: string
  description: string
  shortDescription: string
  categoryLabel: string
  colorLabel: string
}

type ProductBase = {
  id: string
  price: number
  badge: ProductBadge
  category: ProductCategory
  color: ProductColor
  sizes: ProductSize[]
  image: string
  images: string[]
}

type ProductTranslations = Record<
  LocaleCode,
  {
    title: string
    description: string
    shortDescription: string
  }
>

type ProductDefinition = ProductBase & {
  translations: ProductTranslations
}

const normalizeLocale = (locale: string): LocaleCode => {
  if (locale === 'ro' || locale === 'en') return locale
  return 'ru'
}

const labels: Record<
  LocaleCode,
  {
    categories: Record<ProductCategory, string>
    colors: Record<ProductColor, string>
  }
> = {
  ru: {
    categories: {
      sweaters: 'Свитеры',
      hoodies: 'Худи',
      polo: 'Поло'
    },
    colors: {
      white: 'Белый',
      black: 'Черный'
    }
  },
  ro: {
    categories: {
      sweaters: 'Pulovere',
      hoodies: 'Hanorace',
      polo: 'Polo'
    },
    colors: {
      white: 'Alb',
      black: 'Negru'
    }
  },
  en: {
    categories: {
      sweaters: 'Sweaters',
      hoodies: 'Hoodies',
      polo: 'Polo'
    },
    colors: {
      white: 'White',
      black: 'Black'
    }
  }
}

const productDefinitions: ProductDefinition[] = [
  {
    id: 'white-halfzip-osf',
    price: 699,
    badge: 'NEW',
    category: 'sweaters',
    color: 'white',
    sizes: ['S', 'M', 'L'],
    image: '/halfzip-white.png',
    images: ['/halfzip-white.png'],
    translations: {
      ru: {
        title: 'Свитер полузамок белый OSF',
        description:
          'Светлая модель с чистой посадкой и спокойной подачей для повседневного стиля.',
        shortDescription: 'Светлая модель со спокойной подачей.'
      },
      ro: {
        title: 'Pulover half-zip alb OSF',
        description:
          'Model luminos cu croială curată și prezentare calmă pentru stilul de zi cu zi.',
        shortDescription: 'Model luminos cu prezentare calmă.'
      },
      en: {
        title: 'White half-zip sweater OSF',
        description:
          'A light piece with clean fit and calm presentation for everyday style.',
        shortDescription: 'A light piece with calm presentation.'
      }
    }
  },
  {
    id: 'black-halfzip-osf',
    price: 699,
    badge: 'HOT',
    category: 'sweaters',
    color: 'black',
    sizes: ['M', 'L'],
    image: '/halfzip-black.png',
    images: ['/halfzip-black.png'],
    translations: {
      ru: {
        title: 'Свитер полузамок черный OSF',
        description:
          'Темный вариант с более сильным характером и минималистичной эстетикой.',
        shortDescription: 'Темный вариант с более сильным характером.'
      },
      ro: {
        title: 'Pulover half-zip negru OSF',
        description:
          'Variantă închisă cu caracter puternic și estetică minimalistă.',
        shortDescription: 'Variantă închisă cu caracter puternic.'
      },
      en: {
        title: 'Black half-zip sweater OSF',
        description:
          'A darker piece with stronger character and minimalist aesthetics.',
        shortDescription: 'A darker piece with stronger character.'
      }
    }
  },
  {
    id: 'black-hoodie-osf',
    price: 749,
    badge: 'NEW',
    category: 'hoodies',
    color: 'black',
    sizes: ['S', 'M', 'L'],
    image: '/hoodie-black-front.png',
    images: ['/hoodie-black-front.png'],
    translations: {
      ru: {
        title: 'Худи черный OSF',
        description:
          'Базовый худи с символикой бренда и чистой визуальной подачей.',
        shortDescription: 'Базовый худи с понятной идентичностью.'
      },
      ro: {
        title: 'Hanorac negru OSF',
        description:
          'Hanorac de bază cu simbolistică de brand și prezentare curată.',
        shortDescription: 'Hanorac de bază cu identitate clară.'
      },
      en: {
        title: 'Black hoodie OSF',
        description:
          'Essential hoodie with brand symbolism and clean presentation.',
        shortDescription: 'Essential hoodie with clear identity.'
      }
    }
  },
  {
    id: 'white-hoodie-osf',
    price: 749,
    badge: 'NEW',
    category: 'hoodies',
    color: 'white',
    sizes: ['S', 'M', 'L'],
    image: '/hoodie-white-front.png',
    images: ['/hoodie-white-front.png'],
    translations: {
      ru: {
        title: 'Худи белый OSF',
        description:
          'Светлая версия с мягким настроением и минималистичным образом.',
        shortDescription: 'Светлая версия со спокойным стилем.'
      },
      ro: {
        title: 'Hanorac alb OSF',
        description:
          'Versiune luminoasă cu atmosferă calmă și look minimalist.',
        shortDescription: 'Versiune luminoasă cu stil calm.'
      },
      en: {
        title: 'White hoodie OSF',
        description:
          'A light version with calm mood and minimalist look.',
        shortDescription: 'A light version with calm style.'
      }
    }
  },
  {
    id: 'black-polo-osf',
    price: 599,
    badge: 'NEW',
    category: 'polo',
    color: 'black',
    sizes: ['M', 'L'],
    image: '/polo-black.png',
    images: ['/polo-black.png'],
    translations: {
      ru: {
        title: 'Поло черное OSF',
        description:
          'Универсальная модель для собранного, современного и спокойного образа.',
        shortDescription: 'Универсальная модель для собранного образа.'
      },
      ro: {
        title: 'Polo negru OSF',
        description:
          'Piesă versatilă pentru un look ordonat, modern și calm.',
        shortDescription: 'Piesă versatilă pentru un look ordonat.'
      },
      en: {
        title: 'Black polo OSF',
        description:
          'A versatile piece for an ordered, modern, and calm look.',
        shortDescription: 'A versatile piece for an ordered look.'
      }
    }
  },
  {
    id: 'white-polo-osf',
    price: 599,
    badge: 'NEW',
    category: 'polo',
    color: 'white',
    sizes: ['S', 'M', 'L'],
    image: '/polo-white.png',
    images: ['/polo-white.png'],
    translations: {
      ru: {
        title: 'Поло белое OSF',
        description:
          'Светлая модель с чистой эстетикой и легкой стилизацией.',
        shortDescription: 'Светлая модель для базового гардероба.'
      },
      ro: {
        title: 'Polo alb OSF',
        description:
          'Model luminos cu estetică curată și stil ușor de combinat.',
        shortDescription: 'Model luminos pentru garderoba de bază.'
      },
      en: {
        title: 'White polo OSF',
        description:
          'A light piece with clean aesthetics and easy styling.',
        shortDescription: 'A light piece for an essential wardrobe.'
      }
    }
  }
]

export const getProducts = (locale: string): LocalizedProduct[] => {
  const currentLocale = normalizeLocale(locale)
  const localeLabels = labels[currentLocale]

  return productDefinitions.map((product) => {
    const translation = product.translations[currentLocale]

    return {
      id: product.id,
      price: product.price,
      badge: product.badge,
      category: product.category,
      color: product.color,
      sizes: product.sizes,
      image: product.image,
      images: product.images,
      title: translation.title,
      description: translation.description,
      shortDescription: translation.shortDescription,
      categoryLabel: localeLabels.categories[product.category],
      colorLabel: localeLabels.colors[product.color]
    }
  })
}

export const getProductById = (
  id: string,
  locale: string
): LocalizedProduct | null => {
  return getProducts(locale).find((product) => product.id === id) ?? null
}