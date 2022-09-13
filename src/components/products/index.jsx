import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useGlobalFilter, useSortBy, useTable } from "react-table";
import tw from "twin.macro";
import _ from "lodash";
import { GlobalFilter } from "./globalFilter";


const Table = tw.table`
  table-fixed
  text-base
  text-gray-900
`;

const TableHead = tw.thead`
  p-2
`;

const TableRow = tw.tr`
border
border-green-500
`;

const TableHeader = tw.th`
border
border-green-500
p-2
`;

const TableBody = tw.tbody`
`;

const TableData = tw.td`
border
border-green-500
p-5
`;

const Button = tw.button`
  pl-4
  pr-4
  pt-2
  pb-2
  text-black
  rounded-md
  bg-green-300
  hover:bg-green-200
  transition-colors
`;

const pageSize=10;

export function Products(props) {
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState([]);
  const [paginatedPosts, setpaginatedPosts] = useState([]);
  const [currentPage, setcurrentPage] = useState(1);

  const fetchProducts = async () => {
    const response = await axios
      .get("beers/page?page=1&per_page=80")
      .catch((err) => console.log(err));

    if (response) {
      const products = response.data;

      setProducts(products);
      const pageCount = products? Math.ceil(products.length/pageSize):0;
      if (pageCount===1) return null;
      const pages = _.range(1,pageCount+1);
      setCount(pages)
        setpaginatedPosts(_(response.data).slice(0).take(pageSize).value());
        console.log("Products: ", paginatedPosts);

    }
  };
    const pagination = (pageNo)=> {
        setcurrentPage(pageNo);
        const startIndex = (pageNo -1) * pageSize;
        const paginatedPost = _(products).slice(startIndex).take(pageSize).value();
        setpaginatedPosts(paginatedPost)
    }

  const data = useMemo(
    () => [
      {
        id: 1,
        name: "Buzz",
        tagline: "A Real Bitter Experience.",
        description: "A light, crisp and bitter IPA brewed with English and American hops. A small batch brewed only once.",
        image_url: "https://images.punkapi.com/v2/keg.png"
      },
      {
        id: 2,
        name: "Trashy Blonde",
        tagline: "You Know You Shouldn't",
        description: "A titillating, neurotic, peroxide punk of a Pale Ale. Combining attitude, style, substance, and a little bit of low self esteem for good measure; what would your mother say? The seductive lure of the sassy passion fruit hop proves too much to resist. All that is even before we get onto the fact that there are no additives, preservatives, pasteurization or strings attached. All wrapped up with the customary BrewDog bite and imaginative twist.",
        image_url: "https://images.punkapi.com/v2/2.png"
      },
      {
          id: 3,
          name: "Berliner Weisse With Yuzu - B-Sides",
          tagline: "Japanese Citrus Berliner Weisse.",
          description: "Japanese citrus fruit intensifies the sour nature of this German classic.",
          image_url: "https://images.punkapi.com/v2/keg.png"
      },
    ],
    []
  );

  const columns = useMemo(
    () => [
      {
        Header: "Id",
        accessor: "id",
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Description",
        accessor: "description",
      },
    ],
    []
  );

  const productsData = useMemo(() => [...paginatedPosts], [paginatedPosts]);

  const productsColumns = useMemo(
    () =>
      products[0]
        ? Object.keys(products[0])
            .filter((key) => key !== "rating")
            .map((key) => {
              if (key === "image_url")
                return {
                  Header: key,
                  accessor: key,
                  Cell: ({ value }) => <img src={value} />,
                  maxWidth: 70,
                };

              return { Header: key, accessor: key };
            })
        : [],
    [products]
  );

    const addFavourite = async () => {
        const response = await axios
            .get("beers/addToFav")
            .catch((err) => console.log(err));
        if (response) {
        }
    };

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [
      ...columns,
      {
        id: "Edit",
        Header: "Edit",
        Cell: ({ row }) => (
          <Button onClick={() => alert("Adding beer to favourite list: " + row.values.name + " **Not implemented yet")}>
              ♡
          </Button>
        ),
      },
    ]);
  };

  const tableInstance = useTable(
    {
      columns: productsColumns,
      data: productsData,
    },
    useGlobalFilter,
    tableHooks,
    useSortBy
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    preGlobalFilteredRows,
    setGlobalFilter,
    state,
  } = tableInstance;

  useEffect(() => {
    fetchProducts();
  }, []);

  const isEven = (idx) => idx % 2 === 0;

  return (
    <>
      <GlobalFilter
        preGlobalFilteredRows={preGlobalFilteredRows}
        setGlobalFilter={setGlobalFilter}
        globalFilter={state.globalFilter}
      />
      <Table {...getTableProps()}>
        <TableHead>
          {headerGroups.map((headerGroup) => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <TableHeader
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                >
                  {column.render("Header")}
                  {column.isSorted ? (column.isSortedDesc ? " ▼" : " ▲") : ""}
                </TableHeader>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rows.map((row, idx) => {
            prepareRow(row);

            return (
              <TableRow
                {...row.getRowProps()}
                className={isEven(idx) ? "bg-green-400 bg-opacity-30" : ""}
              >
                {row.cells.map((cell, idx) => (
                  <TableData {...cell.getCellProps()}>
                    {cell.render("Cell")}
                  </TableData>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
        <nav className="d-flex justify-content-center">
            <ul className="pagination">
                {
                    count.map((page)=>(
                        <li className={
                            page===currentPage? "page-item active" :"page-item"
                        }>
                            <p className="page-link"
                                onClick={()=>pagination(page)}
                                >{page}
                            </p>
                        </li>
                    ))
                }
            </ul>
        </nav>
    </>
  );
}
