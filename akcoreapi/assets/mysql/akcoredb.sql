-- phpMyAdmin SQL Dump
-- version 5.0.4deb2+deb11u1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 02, 2023 at 05:14 PM
-- Server version: 10.5.18-MariaDB-0+deb11u1
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `akcoredb`
--

-- --------------------------------------------------------

--
-- Table structure for table `abteilungs`
--

CREATE TABLE `abteilungs` (
  `abteilungId` int(11) NOT NULL,
  `abteilungName` varchar(255) NOT NULL,
  `organisationId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `abteilungs`
--

INSERT INTO `abteilungs` (`abteilungId`, `abteilungName`, `organisationId`) VALUES
(2, 'Lager', 1),
(3, 'Verkauf', 2),
(4, 'Einkauf', 2),
(5, 'Filiale', 2),
(6, 'Zentrallogistik', 2),
(7, 'Kundenservice', 2),
(8, 'IT', 2),
(9, 'Projektteam', 2);

-- --------------------------------------------------------

--
-- Table structure for table `fuelltAus`
--

CREATE TABLE `fuelltAus` (
  `mitarbeiterLimesurveyTokenId` varchar(255) DEFAULT NULL,
  `projektId` int(11) DEFAULT NULL,
  `mitarbeiterMitarbeiterId` int(11) NOT NULL,
  `umfrageUmfrageId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fuelltAus`
--

INSERT INTO `fuelltAus` (`mitarbeiterLimesurveyTokenId`, `projektId`, `mitarbeiterMitarbeiterId`, `umfrageUmfrageId`) VALUES
('ALuqil6xqIOAFtH', 8, 3, 17),
('pzm6b1HSQaF2529', 8, 3, 18),
('puo0plQtzpfZaF3', 8, 3, 19),
('dwDqXmhXG1LnuhK', 8, 4, 17),
('JTaqo67FjYc02H7', 8, 4, 18),
('YA0la9Zd5JDRzaO', 8, 4, 19),
('CI491oObKCizxV1', 7, 5, 14),
('WPPYfo8eSbRGPxM', 7, 5, 15),
('yqclBFgUhHaZcCY', 7, 5, 16),
('4n8xjaj5a2w93to', 7, 6, 14),
('Oa4AE7harxxsQ2q', 7, 6, 15),
('U2KNc3Ee4qCOmTS', 7, 6, 16),
('Mbq16iZKl82DaAO', 8, 7, 17),
('1V82x7MSGw0nEUM', 8, 7, 18),
('VP27zDIsNfS75Iz', 8, 7, 19),
('QsiC3fYI2DGc4tj', 7, 8, 14),
('MJ3arwSmNhAQKzn', 7, 8, 15),
('dUWZhGkFsPVtnvC', 7, 8, 16),
('ywBFroTskLAeT8u', 8, 9, 17),
('Hq3Di6iRVaxAxVG', 8, 9, 18),
('AeHigbjl7aZP17G', 8, 9, 19),
('pjQe9nfaqz8FAzh', 7, 10, 14),
('SdFqUWOEqPB3fSB', 7, 10, 15),
('Q6Ao23Ixhd5ITVW', 7, 10, 16),
('Zs6SVC2wXcaqzir', 8, 11, 17),
('TXyYuuuPqaxyLag', 8, 11, 18),
('7Vj7ThzO5jKLWfz', 8, 11, 19),
('jYp69M7r9tx7v6R', 8, 12, 17),
('kyZTzJSPVLKKJrj', 8, 12, 18),
('i3CB5MQ6qmQgf5m', 8, 12, 19),
('MN2ie6ZwI8LEX1p', 7, 13, 14),
('JVBfIK1N3755vnj', 7, 13, 15),
('B5FUguCSHQvWjQF', 7, 13, 16),
('4iWgzVk0aBSTXsG', 8, 14, 17),
('CWnucMhAoryx0a5', 8, 14, 18),
('1kGskN5gAJK8qrb', 8, 14, 19),
('2468Ct3Zds5eRBX', 7, 15, 14),
('uSgKHQK6gr7os0X', 7, 15, 15),
('JNIyafq46upn1Nh', 7, 15, 16),
('p2QGhZUPsv6tYAM', 8, 16, 17),
('4tX5qHwWbMuY50H', 8, 16, 18),
('XHZdNyndtFS3mU1', 8, 16, 19),
('TsMNCz9KidQHeaj', 8, 17, 17),
('HWsQNLKRyyT29hT', 8, 17, 18),
('ujk3AWkxO7e2cFr', 8, 17, 19),
('Hp1berjZcloa60A', 7, 18, 14),
('TrcGAyKg8n7dFSh', 7, 18, 15),
('4BNbmQ0dh51CPxg', 7, 18, 16),
('yuzvem6yiThQRCU', 7, 19, 14),
('gzZmsW04SjNJFG1', 7, 19, 15),
('WcaVbpEXw8iCGCG', 7, 19, 16),
('c8rKxWTzwaXgGTz', 8, 20, 17),
('FhJYVBVkNznG9oW', 8, 20, 18),
('u0G3V4cqaz05yGN', 8, 20, 19),
('HLiIaBAHDZDEz7l', 7, 21, 14),
('cNuxkeAd00QuNW4', 7, 21, 15),
('yo9yerB0YUZDuT5', 7, 21, 16),
('Y25eEqz285BJDy4', 8, 22, 17),
('ItbqpD5WrDOhuFA', 8, 22, 18),
('4vCWRCIiR0oJFzT', 8, 22, 19),
('9zozjzlkWvauRzW', 7, 23, 14),
('jim2DfNKpUtbk6Z', 7, 23, 15),
('mR3HjzeyRImxPtI', 7, 23, 16),
('fLgqSurlZbd3waf', 7, 24, 14),
('ZPhBTStt3B6ibB7', 7, 24, 15),
('SsDLYrvUz9UzPsh', 7, 24, 16),
('aLmnbjHfJ5FtnFu', 8, 25, 17),
('oaezSJzSpbUMDtP', 8, 25, 18),
('9xQ9cmSifihiOf5', 8, 25, 19),
('tTzcUEuqszNGOZu', 7, 26, 14),
('Qt5CN7AgAgZvjfO', 7, 26, 15),
('Y0E3z6oWpKeUhRZ', 7, 26, 16),
('FIAEwK6ddXfNJ36', 7, 27, 14),
('ZUR805lieRTsWok', 7, 27, 15),
('ex68M72cvKQZFyV', 7, 27, 16),
('vBjzZBhaCR1PRjZ', 8, 28, 17),
('0KyE9Nw03chQ3Kl', 8, 28, 18),
('270HfzwMmQYtk5B', 8, 28, 19),
('1SzuR9uDZJQf9b8', 7, 29, 14),
('CnhuXSf5gzraPZg', 7, 29, 15),
('ZUiq1LUn5W5abJh', 7, 29, 16),
('IlHmep6i8wiraVN', 8, 29, 17),
('KXVQSVSCfFCBwCw', 8, 29, 18),
('yJWNLbGuvBAZepz', 8, 29, 19),
('BvIZQknEeyVW1vF', 7, 30, 14),
('FyhzwAmHtutGhFc', 7, 30, 15),
('jkPDGGXQG1vc4J9', 7, 30, 16),
('Ar0vNMZpUsILqmB', 8, 30, 17),
('3fit46XLodkH1iz', 8, 30, 18),
('cg8CiCiXw7yYa4H', 8, 30, 19),
('qjuZk7E1cEPAC1u', 7, 31, 14),
('TtBVvN0gGoFFCxN', 7, 31, 15),
('tu4uhLJEzUA4xCH', 7, 31, 16),
('zYXP5sErJY20Qm5', 8, 31, 17),
('TOtpeaHBPBjNdhz', 8, 31, 18),
('rgIV9DJhxklYvr7', 8, 31, 19),
('aLMY5I2YczyGzjp', 7, 32, 14),
('aaaEel9EEjfqBn5', 7, 32, 15),
('t35gW1BMz9zcuzt', 7, 32, 16),
('noDDIhOtTmu2H8M', 8, 32, 17),
('ZCmQcgBUv8ASR8v', 8, 32, 18),
('xTATlXlyl20yCMG', 8, 32, 19),
('MNgaOIw1JYaEIuX', 7, 33, 14),
('VSrlcwWEmEn119i', 7, 33, 15),
('uN2Hxm01xPzTTdP', 7, 33, 16),
('ZphBQQcMsWVyATU', 8, 33, 17),
('pfBRYVruddrUCeM', 8, 33, 18),
('ZT5cgIfYaa3VT9G', 8, 33, 19),
('n4z4RQlZrkjBpZM', 7, 34, 14),
('a0tiiD5Qlrdtltx', 7, 34, 15),
('LJRYOhyLWTGvR1l', 7, 34, 16);

-- --------------------------------------------------------

--
-- Table structure for table `mitarbeiters`
--

CREATE TABLE `mitarbeiters` (
  `mitarbeiterId` int(11) NOT NULL,
  `mitarbeiterName` varchar(255) DEFAULT NULL,
  `mitarbeiterEmail` varchar(255) DEFAULT NULL,
  `organisationId` int(11) DEFAULT NULL,
  `abteilungId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mitarbeiters`
--

INSERT INTO `mitarbeiters` (`mitarbeiterId`, `mitarbeiterName`, `mitarbeiterEmail`, `organisationId`, `abteilungId`) VALUES
(1, 'Niklas Franz22', 'nifranz@uni-potsdam.de', 1, 2),
(3, 'Dr. Benedikt Bender', 'benedict.bender@wi.uni-potsdam.de', 2, 7),
(4, 'Dr. rer. pol. Christof Thim', 'christof.thim@wi.uni-potsdam.de', 2, 8),
(5, 'M.Sc. Jana Gonnermann', 'jana.gonnermann@wi.uni-potsdam.de', 2, 7),
(6, 'Univ.-Prof. Dr.-Ing Norbert Gronau', 'norbert.gronau@wi.uni-potsdam.de', 2, 5),
(7, 'M.Sc. Adrian Abendroth', 'adrian.abendroth@wi.uni-potsdam.de', 2, 6),
(8, 'M.A. Bonny Brandenburger', 'bonny.brandenburger@wi.uni-potsdam.de', 2, 8),
(9, 'M.Sc. Magnus Busch', 'magnus.busch@wi.uni-potsdam.de', 2, 5),
(10, 'M.Sc. Jasmin Fattah-Weil', 'jasmin.fattah-weil@wi.uni-potsdam.de', 2, 4),
(11, 'Dr. rer. pol. Hanna Theuer', 'hanna.theuer@wi.uni-potsdam.de', 2, 7),
(12, 'Dr.-Ing. Marcus Grum', 'marcus.grum@wi.uni-potsdam.de', 2, 6),
(13, 'Dr. rer. pol. Edzard Weber', 'edzard.weber@wi.uni-potsdam.de', 2, 6),
(14, 'Dipl.-Inform. David Kotarski', 'david.kotarski@wi.uni-potsdam.de', 2, 6),
(15, 'Dr.-Ing. Sander Lass', 'sander.lass@wi.uni-potsdam.de', 2, 3),
(16, 'B.Sc. Simon Borgel', 'simon.borgel@wi.uni-potsdam.de', 2, 5),
(17, 'M.Sc. Marcel Panzer', 'marcel.panzer@wi.uni-potsdam.de', 2, 8),
(18, 'Jeremy Eck', 'jeremy.eck@wi.uni-potsdam.de', 2, 7),
(19, 'M.Sc. Marcel Rojahn', 'marcel.rojahn@wi.uni-potsdam.de', 2, 3),
(20, 'Dipl.-Ing. Felix Starke', 'felix.starke@wi.uni-potsdam.de', 2, 4),
(21, 'Torben Hammes', 'thammes@lswi.de', 2, 8),
(22, 'Nicolas Korjahn', 'nicolas.korjahn@wi.uni-potsdam.de', 2, 4),
(23, 'B.A. Tim Remshardt', 'tim.remshardt@wi.uni-potsdam.de', 2, 7),
(24, 'Marc Ulrich', 'marc.ulrich@wi.uni-potsdam.de', 2, 3),
(25, 'B.Sc. Georg Ritterbusch ', 'georg.ritterbusch@wi.uni-potsdam.de', 2, 7),
(26, 'Philip Schummel ', 'philip.schummel@wi.uni-potsdam.de', 2, 4),
(27, 'Eren Yetiskul', 'eren.yetiskul@wi.uni-potsdam.de', 2, 5),
(28, 'Jakob Thöne ', 'jakob.thoene@wi.uni-potsdam.de', 2, 5),
(29, 'Niklas Franz', 'nifranz@uni-potsdam.de', 2, 9),
(30, 'Lukas Zeitz', 'luzeitz@uni-potsdam.de', 2, 9),
(31, 'Alexandra Wolf', 'alexandra.wolf.1@uni-potsdam.de', 2, 9),
(32, 'Leon Krüger', 'leon.krueger@uni-potsdam.de', 2, 9),
(33, 'Maximilian Wollnik', 'maximilian.wollnik@uni-potsdam.de', 2, 9),
(34, 'M.A. Malte Teichmann', 'malte.teichmann@wi.uni-potsdam.de', 2, 3);

-- --------------------------------------------------------

--
-- Table structure for table `organisations`
--

CREATE TABLE `organisations` (
  `organisationId` int(11) NOT NULL,
  `organisationName` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `organisations`
--

INSERT INTO `organisations` (`organisationId`, `organisationName`) VALUES
(1, 'LSWI-Lehrstuhl'),
(2, 'Marketing-Lehrstuhl'),
(3, 'Informatik-Lehrstuhl');

-- --------------------------------------------------------

--
-- Table structure for table `projekts`
--

CREATE TABLE `projekts` (
  `projektId` int(11) NOT NULL,
  `projektName` varchar(255) DEFAULT NULL,
  `projektBeschreibung` varchar(255) DEFAULT NULL,
  `projektStartDate` date DEFAULT NULL,
  `projektEndDate` date DEFAULT NULL,
  `organisationId` int(11) DEFAULT NULL,
  `projektKibanaDashboardId` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projekts`
--

INSERT INTO `projekts` (`projektId`, `projektName`, `projektBeschreibung`, `projektStartDate`, `projektEndDate`, `organisationId`, `projektKibanaDashboardId`) VALUES
(7, 'Usability Test Gruppe 2', 'hier und da etwas testen', '2023-02-20', '2023-03-03', 2, 'ce76bcf7-1668-49aa-a9f8-a490e798e55c'),
(8, 'TEST - Gruppe 1', 'hier könnte text stehen', '2023-02-20', '2023-03-03', 2, '84617d92-30e9-4579-9aae-5505aad4c01d');

-- --------------------------------------------------------

--
-- Table structure for table `projektTeilnahmes`
--

CREATE TABLE `projektTeilnahmes` (
  `mitarbeiterRolle` varchar(255) DEFAULT NULL,
  `projektProjektId` int(11) NOT NULL,
  `mitarbeiterMitarbeiterId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projektTeilnahmes`
--

INSERT INTO `projektTeilnahmes` (`mitarbeiterRolle`, `projektProjektId`, `mitarbeiterMitarbeiterId`) VALUES
('Change-Manager', 7, 5),
('Change-Manager', 7, 6),
('User', 7, 8),
('User', 7, 10),
('User', 7, 13),
('User', 7, 15),
('User', 7, 18),
('User', 7, 19),
('User', 7, 21),
('User', 7, 23),
('User', 7, 24),
('User', 7, 26),
('User', 7, 27),
('Key-User', 7, 29),
('Key-User', 7, 30),
('Key-User', 7, 31),
('Key-User', 7, 32),
('Key-User', 7, 33),
('User', 7, 34),
('Change-Manager', 8, 3),
('Change-Manager', 8, 4),
('User', 8, 7),
('User', 8, 9),
('User', 8, 11),
('User', 8, 12),
('User', 8, 14),
('User', 8, 16),
('User', 8, 17),
('User', 8, 20),
('User', 8, 22),
('User', 8, 25),
('User', 8, 28),
('Key-User', 8, 29),
('Key-User', 8, 30),
('Key-User', 8, 31),
('Key-User', 8, 32),
('Key-User', 8, 33);

-- --------------------------------------------------------

--
-- Table structure for table `umfrages`
--

CREATE TABLE `umfrages` (
  `umfrageId` int(11) NOT NULL,
  `umfrageStartDate` date DEFAULT NULL,
  `umfrageEndDate` date DEFAULT NULL,
  `umfrageLimesurveyId` varchar(255) DEFAULT NULL,
  `projektId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `umfrages`
--

INSERT INTO `umfrages` (`umfrageId`, `umfrageStartDate`, `umfrageEndDate`, `umfrageLimesurveyId`, `projektId`) VALUES
(14, '2023-02-22', '2023-02-23', '177944', 7),
(15, '2023-02-24', '2023-02-28', '183687', 7),
(16, '2023-03-01', '2023-03-03', '527772', 7),
(17, '2023-02-22', '2023-02-23', '736294', 8),
(18, '2023-02-24', '2023-02-28', '219721', 8),
(19, '2023-03-01', '2023-03-03', '775569', 8);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `abteilungs`
--
ALTER TABLE `abteilungs`
  ADD PRIMARY KEY (`abteilungId`),
  ADD KEY `organisationId` (`organisationId`);

--
-- Indexes for table `fuelltAus`
--
ALTER TABLE `fuelltAus`
  ADD PRIMARY KEY (`mitarbeiterMitarbeiterId`,`umfrageUmfrageId`),
  ADD KEY `umfrageUmfrageId` (`umfrageUmfrageId`);

--
-- Indexes for table `mitarbeiters`
--
ALTER TABLE `mitarbeiters`
  ADD PRIMARY KEY (`mitarbeiterId`),
  ADD KEY `organisationId` (`organisationId`),
  ADD KEY `abteilungId` (`abteilungId`);

--
-- Indexes for table `organisations`
--
ALTER TABLE `organisations`
  ADD PRIMARY KEY (`organisationId`);

--
-- Indexes for table `projekts`
--
ALTER TABLE `projekts`
  ADD PRIMARY KEY (`projektId`),
  ADD KEY `organisationId` (`organisationId`);

--
-- Indexes for table `projektTeilnahmes`
--
ALTER TABLE `projektTeilnahmes`
  ADD PRIMARY KEY (`projektProjektId`,`mitarbeiterMitarbeiterId`),
  ADD KEY `mitarbeiterMitarbeiterId` (`mitarbeiterMitarbeiterId`);

--
-- Indexes for table `umfrages`
--
ALTER TABLE `umfrages`
  ADD PRIMARY KEY (`umfrageId`),
  ADD KEY `projektId` (`projektId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `abteilungs`
--
ALTER TABLE `abteilungs`
  MODIFY `abteilungId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `mitarbeiters`
--
ALTER TABLE `mitarbeiters`
  MODIFY `mitarbeiterId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `organisations`
--
ALTER TABLE `organisations`
  MODIFY `organisationId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `projekts`
--
ALTER TABLE `projekts`
  MODIFY `projektId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `umfrages`
--
ALTER TABLE `umfrages`
  MODIFY `umfrageId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `abteilungs`
--
ALTER TABLE `abteilungs`
  ADD CONSTRAINT `abteilungs_ibfk_1` FOREIGN KEY (`organisationId`) REFERENCES `organisations` (`organisationId`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `fuelltAus`
--
ALTER TABLE `fuelltAus`
  ADD CONSTRAINT `fuelltAus_ibfk_1` FOREIGN KEY (`mitarbeiterMitarbeiterId`) REFERENCES `mitarbeiters` (`mitarbeiterId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fuelltAus_ibfk_2` FOREIGN KEY (`umfrageUmfrageId`) REFERENCES `umfrages` (`umfrageId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `mitarbeiters`
--
ALTER TABLE `mitarbeiters`
  ADD CONSTRAINT `mitarbeiters_ibfk_1` FOREIGN KEY (`organisationId`) REFERENCES `organisations` (`organisationId`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `mitarbeiters_ibfk_2` FOREIGN KEY (`abteilungId`) REFERENCES `abteilungs` (`abteilungId`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `projekts`
--
ALTER TABLE `projekts`
  ADD CONSTRAINT `projekts_ibfk_1` FOREIGN KEY (`organisationId`) REFERENCES `organisations` (`organisationId`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `projektTeilnahmes`
--
ALTER TABLE `projektTeilnahmes`
  ADD CONSTRAINT `projektTeilnahmes_ibfk_1` FOREIGN KEY (`projektProjektId`) REFERENCES `projekts` (`projektId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `projektTeilnahmes_ibfk_2` FOREIGN KEY (`mitarbeiterMitarbeiterId`) REFERENCES `mitarbeiters` (`mitarbeiterId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `umfrages`
--
ALTER TABLE `umfrages`
  ADD CONSTRAINT `umfrages_ibfk_1` FOREIGN KEY (`projektId`) REFERENCES `projekts` (`projektId`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
