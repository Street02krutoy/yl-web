import { createRoute } from "@tanstack/react-router";
import type React from "react";
import { Layer, Map, Source } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import Quiz from "./quiz";
import maplibregl from "maplibre-gl";

const Info: React.FC<{
    dark: boolean;
    name: string;
    desc: string;
    src?: string;
    child?: React.ReactNode;
}> = (props) => (
    <section
        className={`flex flex-col ${props.dark ? "sm:flex-row-reverse" : "sm:flex-row"} items-center sm:items-stretch w-full gap-6 py-8 ${props.dark ? "bg-red-900 text-white dark" : "bg-gray-50 text-gray-900"}`}
    >
        {props.src ? (
            <div className="w-full sm:w-1/2 h-64 sm:h-[50vh] overflow-hidden px-5">
                <img
                    src={props.src}
                    alt={`${props.name} image`}
                    className="w-full h-full object-cover block rounded-xl"
                />
            </div>
        ) : (
            props.child
        )}

        <div className="w-full sm:w-1/2 flex flex-col justify-center p-6 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
                {props.name}
            </h2>
            <p
                className={`text-lg sm:text-xl leading-relaxed ${!props.dark ? "text-gray-700" : "text-gray-200"}`}
            >
                {props.desc}
            </p>
        </div>
    </section>
);

const IndexPage: React.FC = () => {
    const mapRef = useRef<maplibregl.Map | null>(null);
    const [markers, setMarkers] = useState<
        Array<{
            name: string;
            latitude: number;
            longitude: number;
            description: string;
            id: number;
        }>
    >([
        {
            latitude: 56.13646,
            longitude: 47.23653,
            name: "Чебоксары",
            description: "",
            id: 0,
        },
    ]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/points").then(async (res) => {
            setMarkers(await res.json());
        });
    }, []);

    const markerFeatures = markers.map(({ name, latitude, longitude }) => ({
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
        },
        properties: {
            title: name,
        },
    }));

    useEffect(() => {
        return () => {
            // cleanup listeners if map is there
            const m = mapRef.current;
            if (m) {
                try {
                    m.off("click", "point" as any);
                    m.off("mouseenter", "point" as any);
                    m.off("mouseleave", "point" as any);
                } catch (e) {}
            }
        };
    }, []);

    return (
        <>
            <div className="overflow-y-auto">
                <section
                    className="mx-auto max-w-5xl px-6 py-12 text-center"
                    id="about"
                >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text drop-shadow-sm text-gray-600">
                        Чувашия
                    </h1>
                    <p className="mt-4 mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed">
                        Где в самом сердце России скрывается забытая
                        цивилизация, чей язык оказался единственным ключом к
                        расшифровке древнетюркских рун? Что связывает
                        современную Чувашию с легендарными волжскими булгарами,
                        чьи купцы некогда торговали с Багдадом и Скандинавией?
                        Представьте себе край, где женщины носят на голове
                        состояние в серебряных монетах, где вышивка - это не
                        украшение, а зашифрованное послание из глубины веков,
                        где праздник начинается с ритуального вспахивания
                        первого ряда. Здесь до сих пор пьют пиво по рецептам,
                        которым больше тысячи лет, а древние песни звучат так,
                        будто их пели воины великой Булгарии. Эта земля хранит
                        тайну: как народу удалось пронести свою уникальность
                        через все исторические бури, превратив каждый дом в
                        живой музей, а каждый обряд — в мост между эпохами. Что
                        знают чуваши о выживании цивилизаций, чего не знаем мы?
                    </p>{" "}
                </section>
                <Info
                    dark={false}
                    name={"История"}
                    desc={
                        "Чувашия раскинулась в самом сердце европейской части России, на правом берегу великой Волги, там, где река делает свой плавный изгиб на пути к Каспийскому морю. Эта земля — естественный мост между лесным Севером и степным Югом, где смешиваются воздушные потоки с Урала и дыхание центральных равнин. Земли современной Чувашии были заселены финно-уграми ещё в I тысячелетии до нашей эры. Но настоящий исторический перелом произошёл в VII-VIII веках, когда сюда пришли волжские булгары - тюркские племена, создавшие одно из самых развитых государств средневековой Восточной Европы. Волжская Булгария (X-XIII вв.) стала первым государством в регионе, принявшим ислам (922 год), а также крупнейшим торговым центром между Европой и Азией. "
                    }
                    src="image1.png"
                />{" "}
                <Info
                    dark={true}
                    name={"Культура"}
                    desc="Чувашская вышивка была занесена в нематериальное культурное наследие ЮНЕСКО. Её уникальность в исполнении без предварительного рисунка, использовании двустороннего шва 'роспись' и глубокой цветовой символике: красный - жизнь и солнце, чёрный - земля и мудрость, белый - свет и чистота. Основные узоры несут космогонические смыслы: 'Древо жизни' как мировая ось, 'Солнечная розетка' как восьмилучевая звезда, 'Конь' - символ солнца у древних тюрков, 'Бараньи рога' - плодородие. В чувашском народном костюме каждая деталь рассказывает о возрасте, семейном положении, регионе и социальном статусе человека. Основой женского костюма служит белая холщовая рубаха-кĕпе, украшенная сложнейшей вышивкой-росписью - двусторонним швом, выполняемым без предварительного рисунка. "
                    src="image2.png"
                />
                <Info
                    dark={false}
                    name={"Праздники"}
                    desc={
                        "Календарные обряды образуют сакральный круг года. Сухат-туй (Встреча весны) 22 марта - встречают 'Госпожу Весну', красят яйца в луковой шелухе, катаются на качелях 'чтобы земля быстрее поворачивалась'. Акатуй (Праздник плуга) — главный национальный праздник после посевных с конными скачками, борьбой 'кӗрешӳ', состязаниями певцов. Синсе — ноябрьский ритуал поминовения предков с приготовлением ритуальной каши 'йӑва' и кормлением духов через окно. Сӗрен в зимнее солнцестояние — праздник возрождения солнца с ряжеными и сжиганием соломенного чучела Зимы."
                    }
                    src="image3.png"
                />
                <div>
                    <Info
                        dark={true}
                        name={"Пройдите квиз"}
                        desc={
                            "и узнайте, насколько много вы знаете о чувашской культуре"
                        }
                        child={
                            <Quiz
                                questions={[
                                    {
                                        id: "0",
                                        text: "Кто является основоположником чувашской письменности?",
                                        options: [
                                            "М. Сеспель",
                                            "П. Хузангай",
                                            "Я. Яковлев",
                                        ],
                                        correctIndex: 3,
                                        correctPercentage: 95,
                                    },

                                    {
                                        id: "1",
                                        text: "От какого рода по легенде произошел чувашский народ?",
                                        options: [
                                            "от рода Улыпа",
                                            "от рода Сувара",
                                            "от рода Болгара",
                                        ],
                                        correctIndex: 2,
                                        correctPercentage: 90,
                                    },

                                    {
                                        id: "2",
                                        text: "Какие птицы изображены на гербе Чебоксар?",
                                        options: ["утки", "гуси", "лебеди"],
                                        correctIndex: 1,
                                        correctPercentage: 98,
                                    },

                                    {
                                        id: "3",
                                        text: "В честь кого чуваши назвали самую большую реку Волгу (на чувашском языке)?",
                                        options: [
                                            "в честь кузнеца – Азамат",
                                            "в честь богатыря – Чемен",
                                            "в честь вождя - Атăл",
                                        ],
                                        correctIndex: 3,
                                        correctPercentage: 89,
                                    },

                                    {
                                        id: "4",
                                        text: "Цвет основного фона государственного флага Чувашской Республики?",
                                        options: [
                                            "синего",
                                            "белого",
                                            "жёлтого",
                                        ],
                                        correctIndex: 3,
                                        correctPercentage: 100,
                                    },

                                    {
                                        id: "5",
                                        text: "Кем был Гузовский, имя которого носит одна из улиц Чебоксар?",
                                        options: [
                                            "лесоводом",
                                            "военачальником",
                                            "композитором",
                                        ],
                                        correctIndex: 1,
                                        correctPercentage: 87,
                                    },

                                    {
                                        id: "6",
                                        text: "Название головного убора замужних чувашек?",
                                        options: ["xушпу", "тухья", "aма"],
                                        correctIndex: 1,
                                        correctPercentage: 94,
                                    },

                                    {
                                        id: "7",
                                        text: "Назовите автора Чувашского государственного герба?",
                                        options: [
                                            "А.Миттов",
                                            "Э.Юрьев",
                                            "В.Смирнов",
                                        ],
                                        correctIndex: 2,
                                        correctPercentage: 90,
                                    },

                                    {
                                        id: "8",
                                        text: "Украшения представляют собой одно из ярких явлений развития чувашского народного искусства. Из каких материалом изготавливались украшения?",
                                        options: [
                                            "из драгоценных камней",
                                            "из серебра и бисера",
                                            "из золота и бисера",
                                        ],
                                        correctIndex: 2,
                                        correctPercentage: 100,
                                    },

                                    {
                                        id: "9",
                                        text: "В каком месяце древние чуваши отмечали наступление нового года?",
                                        options: ["октябрь", "март", "январь"],
                                        correctIndex: 2,
                                        correctPercentage: 88,
                                    },
                                ]}
                            />
                        }
                    />
                </div>
                <div className="relative">
                    <Map
                        onLoad={(e: any) => {
                            const map: maplibregl.Map = e.target;
                            mapRef.current = map;

                            // click on point layer -> show popup
                            map.on("click", "point", (ev: any) => {
                                const feature = ev.features && ev.features[0];
                                if (!feature) return;
                                const coords =
                                    feature.geometry.coordinates.slice();
                                const title =
                                    feature.properties?.title ?? "Marker";
                                new maplibregl.Popup({ offset: 12 })
                                    .setLngLat(coords)
                                    .setHTML(
                                        `<strong>${String(title)}</strong>`,
                                    )
                                    .addTo(map);
                            });

                            // hover cursor
                            map.on(
                                "mouseenter",
                                "point",
                                () =>
                                    (map.getCanvas().style.cursor = "pointer"),
                            );
                            map.on(
                                "mouseleave",
                                "point",
                                () => (map.getCanvas().style.cursor = ""),
                            );
                        }}
                        initialViewState={{
                            latitude: 56.13646,
                            longitude: 47.23653,
                            zoom: 9,
                        }}
                        maxBounds={[45.23653, 53.13646, 49.23653, 59.13646]}
                        style={{
                            width: window.visualViewport?.width,
                            height: (window.visualViewport?.height ?? 814) - 70,
                        }}
                        mapStyle={{
                            version: 8,
                            sources: {
                                "osm-tiles": {
                                    type: "raster",
                                    tiles: [
                                        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                                    ],
                                    tileSize: 256,
                                    attribution: "© OpenStreetMap contributors",
                                },
                            },
                            layers: [
                                {
                                    id: "osm-tiles",
                                    type: "raster",
                                    source: "osm-tiles",
                                },
                            ],
                        }}
                    >
                        <Source
                            type="geojson"
                            data={{
                                type: "FeatureCollection",
                                features: markerFeatures as any,
                            }}
                        >
                            <Layer
                                id="point"
                                type="circle"
                                paint={{
                                    "circle-radius": 10,
                                    "circle-color": "#82181a",
                                }}
                            ></Layer>
                        </Source>
                    </Map>
                    <div
                        className="absolute top-4 left-4 z-1 bg-white/80 text-black p-2 rounded"
                        id="map"
                    >
                        <div className="text-sm font-semibold">Карта</div>
                        <div className="text-xs">Культурные места Чувашии</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default (parentRoute: any) =>
    createRoute({
        path: "/",
        component: IndexPage,
        getParentRoute: () => parentRoute,
    });
