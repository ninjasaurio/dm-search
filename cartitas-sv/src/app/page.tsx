import Image from "next/image";
import data from "./data/results.json";

export default function Home() {
  const TotalStockCards = () => {
    // Filtra los objetos del archivo JSON que tienen isStock como verdadero
    const stockCards = data.filter((card) => card.isStock);

    // Obtiene el total de cartas encontradas en stock
    const totalStockCards = stockCards.length;

    // Obtiene el total de cartas que no están en stock
    const totalNoStockCards = data.length - totalStockCards;

    return (
      <div className="flex justify-content-between">
        <p className="font-bold">Total de cartas buscadas: {data.length}</p>
        <p className="font-bold">Total de cartas en stock: {totalStockCards}</p>
        <p className="font-bold">Total de cartas sin stock: {totalNoStockCards}</p>
      </div>
    );
  };

  return (
    <main>
      <div className="w-9 mx-auto">
        <h1>Lista de cartas disponibles segun busqueda</h1>
        <p>Puto el maitro 😘</p>

        <TotalStockCards />

        {data.map((product) => (
          <div className="my-5" key={product.id}>
            <div className="flex">
              <h2 className="m-0 mr-4">{product.name}</h2>
              <span
                className={`p-tag p-component ${
                  product.isStock ? "p-tag-success" : "p-tag-danger"
                } `}
              >
                <span className="p-tag-value">
                  {product.isStock ? "En stock" : "Agotado"}
                </span>
                <span></span>
              </span>
            </div>

            {product.variants.length > 0 && (
              <div>
                <h3>Variantes disponibles:</h3>
                <div className="flex align-items-center justify-content-start flex-wrap gap-4">
                  {product.variants.map((variant) => (
                    <div className="flex flex-column" key={variant.id}>
                      <p>Set: {variant.set}</p>
                      <a
                        href={`https://dragons-and-magic.herokuapp.com/single-card/${variant.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src={variant.image}
                          alt="Imagen del producto"
                          width={244}
                          height={340}
                          className="mb-2"
                        />
                      </a>
                      <span className="p-tag p-component p-tag-success">
                        <span className="p-tag-value">
                          STOCK: {variant.stock}
                        </span>
                        <span></span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
