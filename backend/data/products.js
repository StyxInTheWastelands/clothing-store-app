// backend/data/products.js

// Struktura danych reprezentująca bazę produktów w sklepie odzieżowym
const products = [
    {
        id: 1,
        name: "Koszulka Essential Tee",
        description: "Koszulka o kroju boxy wykonana z bawełny supima o gramaturze 240g. Lekko oversize, o czystej, minimalistycznej sylwetce.",
        category: "Góra",
        subCategory: "T-shirts",
        gender: "Mężczyzna",
        price: 179.00,
        sizes: ["XS", "S", "M", "L", "XL"],
        color: "Biały",
        style: "Minimalistyczny",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500" 
    },
    {
        id: 2,
        name: "Jeansy Slim Taper",
        description: "Klasyczne jeansy o zwężanym kroju, wykonane z wysokiej jakości denimu z dodatkiem elastanu dla większego komfortu.",
        category: "Dół",
        subCategory: "Jeans",
        gender: "Mężczyzna",
        price: 499.00,
        sizes: ["S", "M", "L"],
        color: "Czarny",
        style: "Casual",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500"
    },
    {
        id: 3,
        name: "Torebka Pikowana Crossbody",
        description: "Elegancka torebka wykonana ze skóry ekologicznej z charakterystycznymi pikowaniami i złotym logo.",
        category: "Akcesoria",
        subCategory: "Torebki",
        gender: "Kobieta",
        price: 329.00,
        sizes: ["UNI"],
        color: "Czarny",
        style: "Elegancki",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500"
    }
];

module.exports = products;